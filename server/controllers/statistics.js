/* eslint-disable brace-style */
/* eslint-disable no-unused-vars */
const express = require('express')
const { models } = require('../models')
const { isAuthenticated } = require('../middlewares/authentication')
const router = express.Router()
const { infoLogger, errorLogger } = require('../logs/logger')
const { sequelize } = require('../models')
const { Op } = require('sequelize')

function logError (req, error) {
  const request = req.body.data ? req.body.data : (req.params ? req.params : req.query)
  errorLogger.error({
    message: `Error ${req.path}`,
    method: req.method,
    endpoint: req.path,
    request,
    error,
    user: req.user.id
  })
}

function logInfo (req, response) {
  const request = req.body.data ? req.body.data : (req.params ? req.params : req.query)
  infoLogger.info({
    message: `Accessed ${req.path}`,
    method: req.method,
    endpoint: req.path,
    request,
    response,
    user: req.user.id
  })
}

router.get('/top-rated-courses', async (req, res) => {
  const { limit } = req.query

  const maxResults = limit ? parseInt(limit, 10) : 10
  const m = 10
  try {
    const result = await sequelize.query(`
      WITH SystemAverage AS (
        SELECT AVG(rating) AS systemAverage
        FROM enrollments
        WHERE rating IS NOT NULL
      )
      SELECT 
        e.courseId,
        COUNT(e.courseId) AS v,
        AVG(e.rating) AS R,
        (COUNT(e.courseId) / (COUNT(e.courseId) + :m)) * AVG(e.rating) + 
        (:m / (COUNT(e.courseId) + :m)) * (SELECT systemAverage FROM SystemAverage) AS bayesianAverage,
        c.name AS courseName
      FROM enrollments e
      INNER JOIN courses c ON e.courseId = c.id
      WHERE e.rating IS NOT NULL
      GROUP BY e.courseId, c.name
      ORDER BY bayesianAverage DESC
      LIMIT :limit
    `, {
      replacements: { limit: maxResults, m },
      type: sequelize.QueryTypes.SELECT
    })

    if (Array.isArray(result)) {
      const resultFormatted = result.map(course => ({
        courseId: course.courseId,
        courseName: course.courseName,
        bayesianAverage: parseFloat(course.bayesianAverage).toFixed(2),
        totalRatings: course.v,
        averageRating: parseFloat(course.R).toFixed(2)
      }))

      res.json(resultFormatted)
    } else {
      res.status(500).json({ error: 'Unexpected result format' })
    }
  } catch (error) {
    console.error('Error fetching top-rated courses:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// [
//   {
//       "courseId": 15,
//       "courseName": "Artificial Intelligence",
//       "bayesianAverage": 4.33,
//       "totalRatings": 1,
//       "averageRating": 5
//   },

router.get('/rating/:courseId', async (req, res) => {
  const courseId = req.params.courseId

  try {
    const ratingCounts = await models.Enrollment.findAll({
      attributes: [
        'rating',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { courseId },
      group: ['rating'],
      order: [['rating', 'ASC']]
    })

    const result = Array.from({ length: 5 }, (_, i) => ({
      rating: i + 1,
      count: 0
    })).reduce((acc, item) => {
      acc[item.rating] = item.count
      return acc
    }, {})

    ratingCounts.forEach(rating => {
      const star = rating.get('rating')
      const count = rating.get('count')
      result[star] = count
    })

    res.json(result)
  } catch (error) {
    console.error('Error fetching ratings:', error)
    res.status(500).json({ error: error.message })
  }
})

// {
//   "1": 0,
//   "2": 1,
//   "3": 0,
//   "4": 1,
//   "5": 0
// }

router.get('/top-enrollment-courses', async (req, res) => {
  const { month, year, limit } = req.query

  const maxResults = limit ? parseInt(limit, 10) : 10

  const filterYear = year?.trim() !== '' ? parseInt(year, 10) : undefined
  const filterMonth = month?.trim() !== '' ? parseInt(month, 10) : undefined

  const dateCondition = {}

  if (filterYear) {
    dateCondition[Op.and] = [
      sequelize.where(sequelize.fn('YEAR', sequelize.col('enrollmentDate')), filterYear)
    ]
  }

  if (filterYear && filterMonth) {
    dateCondition[Op.and].push(
      sequelize.where(sequelize.fn('MONTH', sequelize.col('enrollmentDate')), filterMonth)
    )
  }

  try {
    const topCourses = await models.Enrollment.findAll({
      attributes: [
        'courseId',
        [sequelize.fn('COUNT', sequelize.col('Enrollment.id')), 'enrollmentCount']
      ],
      where: {
        ...dateCondition,
        status: 1
      },
      group: ['courseId'],
      order: [[sequelize.literal('enrollmentCount'), 'DESC']],
      limit: maxResults,
      include: [
        {
          model: models.Course,
          attributes: ['id', 'name'],
          where: { status: { [Op.in]: [2, 3, 4, 5, 6, 7] } }
        }
      ]
    })

    const result = topCourses.map(course => ({
      courseId: course.courseId,
      courseName: course.Course?.name || 'N/A',
      enrollmentCount: course.get('enrollmentCount')
    }))

    res.json(result)
  } catch (error) {
    console.error('Error fetching top courses:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// [
//   {
//       "courseId": 4,
//       "courseName": "Machine Learning Essentials",
//       "enrollmentCount": 1
//   }
// ]

router.get('/top-earning-courses', async (req, res) => {
  const { year, month, limit } = req.query

  const filterYear = year?.trim() !== '' ? parseInt(year, 10) : undefined
  const filterMonth = month?.trim() !== '' ? parseInt(month, 10) : undefined

  const whereCondition = {}
  if (filterYear) {
    whereCondition[Op.and] = [
      sequelize.where(sequelize.fn('YEAR', sequelize.col('enrollmentDate')), year)
    ]
  }
  if (filterYear && filterMonth) {
    whereCondition[Op.and].push(
      sequelize.where(sequelize.fn('MONTH', sequelize.col('enrollmentDate')), month)
    )
  }
  whereCondition.status = 1

  const maxResults = limit ? parseInt(limit, 10) : 10

  try {
    const topEarningCourses = await models.Enrollment.findAll({
      attributes: [
        'courseId',
        [sequelize.fn('SUM', sequelize.col('price')), 'totalEarnings']
      ],
      where: whereCondition,
      group: ['courseId'],
      order: [[sequelize.fn('SUM', sequelize.col('price')), 'DESC']],
      limit: maxResults,
      include: [
        {
          model: models.Course,
          attributes: ['name'],
          where: { status: { [Op.in]: [2, 3, 4, 5, 6, 7] } }
        }
      ]
    })

    const result = topEarningCourses.map(course => ({
      courseId: course.courseId,
      courseName: course.Course?.name || 'N/A',
      totalEarnings: parseFloat(course.get('totalEarnings')) || 0
    }))

    res.json(result)
  } catch (error) {
    console.error('Error fetching top earning courses:', error)
    res.status(500).json({ error: error.message })
  }
})

// [
//   {
//       "courseId": 5,
//       "totalEarnings": "10000.00",
//       "totalEarnings": 60000
//   }
// ]

router.get('/allRegistrationsAndRevenue', isAuthenticated, async (req, res) => {
  const { type, year, month } = req.query

  if (!type || !year) {
    return res.status(400).json({ error: 'Type (day/month) and year are required' })
  }

  try {
    const dateFilter = type === 'day'
      ? sequelize.literal('DAY(Enrollment.createdAt)')
      : sequelize.literal('MONTH(Enrollment.createdAt)')

    const whereCondition = {
      status: 1,
      createdAt: {
        [Op.gte]: new Date(`${year}-01-01`),
        [Op.lt]: new Date(`${parseInt(year) + 1}-01-01`)
      }
    }

    if (type === 'day' && month) {
      whereCondition.createdAt[Op.gte] = new Date(`${year}-${month}-01`)
      whereCondition.createdAt[Op.lt] = new Date(`${year}-${parseInt(month) + 1}-01`)
    }

    const stats = await models.Enrollment.findAll({
      attributes: [
        [dateFilter, 'dateValue'],
        [sequelize.fn('COUNT', sequelize.col('Enrollment.id')), 'totalStudents'],
        [sequelize.fn('SUM', sequelize.col('Course.price')), 'totalRevenue']
      ],
      include: [
        {
          model: models.Course,
          attributes: [],
          where: { status: { [Op.in]: [2, 3, 4, 5, 6, 7] } }
        }
      ],
      where: whereCondition,
      group: [dateFilter],
      order: [[dateFilter, 'ASC']],
      raw: true
    })

    const result = {
      labels: [],
      totalRegistrationsData: [],
      totalRevenueData: []
    }

    if (type === 'day') {
      const daysInMonth = new Date(year, month, 0).getDate()
      result.labels = Array.from({ length: daysInMonth }, (_, i) => `Ngày ${i + 1}`)
      result.totalRegistrationsData = Array(daysInMonth).fill(0)
      result.totalRevenueData = Array(daysInMonth).fill(0)

      stats.forEach(stat => {
        const day = parseInt(stat.dateValue, 10) - 1
        result.totalRegistrationsData[day] = parseInt(stat.totalStudents, 10)
        result.totalRevenueData[day] = parseFloat(stat.totalRevenue) || 0
      })
    } else if (type === 'month') {
      result.labels = [
        'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
      ]
      result.totalRegistrationsData = Array(12).fill(0)
      result.totalRevenueData = Array(12).fill(0)

      stats.forEach(stat => {
        const month = parseInt(stat.dateValue, 10) - 1
        result.totalRegistrationsData[month] = parseInt(stat.totalStudents, 10)
        result.totalRevenueData[month] = parseFloat(stat.totalRevenue) || 0
      })
    }

    res.json({
      labels: result.labels,
      totalRegistrationsData: result.totalRegistrationsData,
      totalRevenueData: result.totalRevenueData
    })
  } catch (error) {
    console.error('Error fetching statistics:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/user-course-growth-statistics', isAuthenticated, async (req, res) => {
  const { type, year, month } = req.query

  if (!type || !year) {
    return res.status(400).json({ error: 'Type (day/month) and year are required' })
  }

  try {
    const dateFilter = type === 'day'
      ? sequelize.literal('DAY(createdAt)')
      : sequelize.literal('MONTH(createdAt)')

    const courseWhereCondition = {
      status: { [Op.gte]: 0 },
      startDate: {
        [Op.gte]: new Date(`${year}-01-01`),
        [Op.lt]: new Date(`${parseInt(year) + 1}-01-01`)
      }
    }

    const userWhereCondition = {
      createdAt: {
        [Op.gte]: new Date(`${year}-01-01`),
        [Op.lt]: new Date(`${parseInt(year) + 1}-01-01`)
      }
    }

    // Nếu type là 'day' và có tháng, thêm điều kiện cho tháng
    if (type === 'day' && month) {
      courseWhereCondition.startDate[Op.gte] = new Date(`${year}-${month}-01`)
      courseWhereCondition.startDate[Op.lt] = new Date(`${year}-${parseInt(month) + 1}-01`)
      userWhereCondition.createdAt[Op.gte] = new Date(`${year}-${month}-01`)
      userWhereCondition.createdAt[Op.lt] = new Date(`${year}-${parseInt(month) + 1}-01`)
    }

    // Truy vấn số lượng khóa học tăng trưởng
    const courseGrowth = await models.Course.findAll({
      attributes: [
        [dateFilter, 'dateValue'],
        [sequelize.fn('COUNT', sequelize.col('Course.id')), 'totalCourses']
      ],
      where: courseWhereCondition,
      group: [dateFilter],
      order: [[dateFilter, 'ASC']],
      raw: true
    })

    // Truy vấn số lượng người dùng mới
    const userGrowth = await models.User.findAll({
      attributes: [
        [dateFilter, 'dateValue'],
        [sequelize.fn('COUNT', sequelize.col('User.id')), 'totalUsers']
      ],
      where: userWhereCondition,
      group: [dateFilter],
      order: [[dateFilter, 'ASC']],
      raw: true
    })

    const result = {
      labels: [],
      courseGrowthData: [],
      userGrowthData: []
    }

    if (type === 'day') {
      const daysInMonth = new Date(year, month, 0).getDate()
      result.labels = Array.from({ length: daysInMonth }, (_, i) => `Ngày ${i + 1}`)
      result.courseGrowthData = Array(daysInMonth).fill(0)
      result.userGrowthData = Array(daysInMonth).fill(0)

      courseGrowth.forEach(item => {
        const day = parseInt(item.dateValue, 10) - 1
        result.courseGrowthData[day] = parseInt(item.totalCourses, 10)
      })

      userGrowth.forEach(item => {
        const day = parseInt(item.dateValue, 10) - 1
        result.userGrowthData[day] = parseInt(item.totalUsers, 10)
      })
    } else if (type === 'month') {
      result.labels = [
        'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
      ]
      result.courseGrowthData = Array(12).fill(0)
      result.userGrowthData = Array(12).fill(0)

      courseGrowth.forEach(item => {
        const month = parseInt(item.dateValue, 10) - 1
        result.courseGrowthData[month] = parseInt(item.totalCourses, 10)
      })

      userGrowth.forEach(item => {
        const month = parseInt(item.dateValue, 10) - 1
        result.userGrowthData[month] = parseInt(item.totalUsers, 10)
      })
    }

    res.json({
      labels: result.labels,
      courseGrowthData: result.courseGrowthData,
      userGrowthData: result.userGrowthData
    })
  } catch (error) {
    console.error('Error fetching growth statistics:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Lấy các dữ liệu tổng quan toàn hệ thống
router.get('/overview', async (req, res) => {
  try {
    const totalRevenue = await models.Enrollment.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('Course.price')), 'totalRevenue']
      ],
      include: [
        {
          model: models.Course,
          attributes: []
        }
      ],
      where: {
        status: 1
      }
    })

    const totalEnrollments = await models.Enrollment.count({
      where: {
        status: 1
      }
    })

    const totalCourses = await models.Course.count({
      where: {
        status: { status: { [Op.in]: [2, 3, 4, 5, 6, 7] } }
      }
    })

    const totalUsers = await models.User.count()

    const result = {
      totalRevenue: totalRevenue[0]?.get('totalRevenue') || 0,
      totalEnrollments,
      totalCourses,
      totalUsers
    }

    res.json(result)
  } catch (error) {
    console.error('Error fetching statistics:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/top-earning-teachers', async (req, res) => {
  const { year, month, limit } = req.query

  const filterYear = year?.trim() !== '' ? parseInt(year, 10) : undefined
  const filterMonth = month?.trim() !== '' ? parseInt(month, 10) : undefined

  const whereCondition = {}
  if (filterYear) {
    whereCondition[Op.and] = [
      sequelize.where(sequelize.fn('YEAR', sequelize.col('Enrollment.enrollmentDate')), filterYear)
    ]
  }
  if (filterYear && filterMonth) {
    whereCondition[Op.and].push(
      sequelize.where(sequelize.fn('MONTH', sequelize.col('Enrollment.enrollmentDate')), filterMonth)
    )
  }
  whereCondition.status = 1

  const maxResults = limit ? parseInt(limit, 10) : 10

  try {
    const topEarningTeachers = await models.Enrollment.findAll({
      attributes: [
        [sequelize.col('Course.assignedBy'), 'teacherId'],
        [sequelize.fn('SUM', sequelize.col('Course.price')), 'totalEarnings'] // Tính tổng doanh thu từ course
      ],
      where: whereCondition,
      include: [
        {
          model: models.Course,
          attributes: ['assignedBy', 'price'], // Lấy giá khóa học
          where: { status: { [Op.in]: [2, 3, 4, 5, 6, 7] } },
          include: [
            {
              model: models.User,
              attributes: ['id', 'lastName', 'firstName', 'email']
            }
          ]
        }
      ],
      group: ['Course.assignedBy'],
      order: [[sequelize.fn('SUM', sequelize.col('Course.price')), 'DESC']], // Sắp xếp theo tổng doanh thu
      limit: maxResults
    })

    const result = topEarningTeachers.map(teacher => ({
      teacherId: teacher.get('teacherId'),
      teacherName: `${teacher.Course?.User?.firstName || ''} ${teacher.Course?.User?.lastName || ''}`.trim() || 'N/A',
      teacherEmail: teacher.Course?.User?.email || 'N/A',
      totalEarnings: parseFloat(teacher.get('totalEarnings')) || 0
    }))

    res.json(result)
  } catch (error) {
    console.error('Error fetching top earning teachers:', error)
    res.status(500).json({ error: error.message })
  }
})

// [
//   {
//       "teacherId": 2,
//       "teacherName": "Ellie Gleason",
//       "teacherEmail": "Heaven.Beier@gmail.com",
//       "totalEarnings": 10000
//   },

// Thống kê doanh thu đăng ký của 1 khóa học
router.get('/StatisticsEnrollmentAndRevenueByCourse', async (req, res) => {
  const { courseId, type, year, month } = req.query

  if (!courseId || !type || !year) {
    return res.status(400).json({ error: 'CourseId, type (day/month), and year are required' })
  }

  try {
    const dateFilter = type === 'day'
      ? sequelize.literal('DAY(Enrollment.enrollmentDate)')
      : sequelize.literal('MONTH(Enrollment.enrollmentDate)')

    const whereCondition = {
      status: 1,
      '$Course.id$': courseId
    }

    whereCondition[Op.and] = [
      sequelize.where(sequelize.fn('YEAR', sequelize.col('Enrollment.enrollmentDate')), '=', year)
    ]

    if (type === 'day' && month) {
      whereCondition[Op.and].push(
        sequelize.where(sequelize.fn('MONTH', sequelize.col('Enrollment.enrollmentDate')), '=', month)
      )
    }

    const stats = await models.Enrollment.findAll({
      attributes: [
        [dateFilter, 'dateValue'],
        [sequelize.fn('COUNT', sequelize.col('Enrollment.id')), 'registrations'],
        [sequelize.fn('SUM', sequelize.col('Course.price')), 'revenue']
      ],
      include: [
        {
          model: models.Course,
          attributes: []
        }
      ],
      where: whereCondition,
      group: [dateFilter],
      order: [[dateFilter, 'ASC']],
      raw: true
    })

    const result = {
      labels: [],
      registrations: [],
      revenue: []
    }

    if (type === 'day') {
      const daysInMonth = new Date(year, month, 0).getDate()
      result.labels = Array.from({ length: daysInMonth }, (_, i) => `Ngày ${i + 1}`)
      result.registrations = Array(daysInMonth).fill(0)
      result.revenue = Array(daysInMonth).fill(0)

      stats.forEach(stat => {
        const day = parseInt(stat.dateValue, 10)
        const index = day - 1
        result.registrations[index] = parseInt(stat.registrations, 10)
        result.revenue[index] = parseFloat(stat.revenue) || 0
      })
    } else if (type === 'month') {
      result.labels = [
        'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
      ]
      result.registrations = Array(12).fill(0)
      result.revenue = Array(12).fill(0)

      stats.forEach(stat => {
        const month = parseInt(stat.dateValue, 10) - 1
        result.registrations[month] = parseInt(stat.registrations, 10)
        result.revenue[month] = parseFloat(stat.revenue) || 0
      })
    }

    res.json(result)
  } catch (error) {
    console.error('Error fetching course statistics:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Lấy thông tin tổng quan phân tích của khóa học
router.get('/courseStatistics', async (req, res) => {
  const { courseId } = req.query

  if (!courseId) {
    return res.status(400).json({ error: 'CourseId is required' })
  }

  try {
    const courseStats = await models.Enrollment.findOne({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('Enrollment.id')), 'totalStudents'],
        [sequelize.fn('SUM', sequelize.col('Course.price')), 'totalRevenue']
      ],
      include: [
        {
          model: models.Course,
          attributes: [],
          where: { status: { [Op.in]: [2, 3, 4, 5, 6, 7] } }
        }
      ],
      where: {
        status: 1,
        '$Course.id$': courseId
      },
      raw: true
    })

    const completedStudents = await models.Enrollment.count({
      where: {
        status: 1,
        courseId,
        progress: 100
      }
    })

    const averageRatingData = await models.Enrollment.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating']
      ],
      where: {
        status: 1,
        courseId,
        rating: { [Op.not]: null }
      },
      raw: true
    })

    const averageRating = parseFloat(averageRatingData?.averageRating) || 0

    res.json({
      totalRevenue: parseFloat(courseStats?.totalRevenue) || 0,
      totalStudents: parseInt(courseStats?.totalStudents) || 0,
      averageRating: averageRating.toFixed(1),
      completedStudents
    })
  } catch (error) {
    console.error('Error fetching course statistics:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// {
//   "totalRevenue": 30000,
//   "totalStudents": 3,
//   "totalReviews": 3,
//   "completedStudents": 0
// }

router.get('/StatisticsEnrollmentAndRevenueByTeacher', isAuthenticated, async (req, res) => {
  const { type, year, month, teacherId } = req.query
  const userId = req.user.id
  const actualTeacherId = teacherId || userId

  if (!type || !year) {
    return res.status(400).json({ error: 'Type (day/month), and year are required' })
  }

  try {
    const dateFilter = type === 'day'
      ? sequelize.literal('DAY(Enrollment.enrollmentDate)')
      : sequelize.literal('MONTH(Enrollment.enrollmentDate)')

    const whereCondition = {
      status: 1,
      '$Course.assignedBy$': actualTeacherId,
      '$Course.id$': { [Op.not]: null }
    }

    if (year) {
      whereCondition[Op.and] = [
        sequelize.where(sequelize.fn('YEAR', sequelize.col('Enrollment.enrollmentDate')), '=', year)
      ]
    }

    if (type === 'day' && month) {
      whereCondition[Op.and].push(
        sequelize.where(sequelize.fn('MONTH', sequelize.col('Enrollment.enrollmentDate')), '=', month)
      )
    }

    const stats = await models.Enrollment.findAll({
      attributes: [
        [dateFilter, 'dateValue'],
        [sequelize.fn('COUNT', sequelize.col('Enrollment.id')), 'totalStudents'],
        [sequelize.fn('SUM', sequelize.col('Course.price')), 'totalRevenue']
      ],
      include: [
        {
          model: models.Course,
          attributes: [],
          where: { status: { [Op.in]: [2, 3, 4, 5, 6, 7] } }
        }
      ],
      where: whereCondition,
      group: [dateFilter],
      raw: true
    })

    console.log(stats)

    const result = {
      labels: [],
      totalStudentsData: [],
      totalRevenueData: []
    }

    if (type === 'day') {
      const daysInMonth = new Date(year, month, 0).getDate()
      result.totalStudentsData = Array(daysInMonth).fill(0)
      result.totalRevenueData = Array(daysInMonth).fill(0)
      result.labels = Array.from({ length: daysInMonth }, (_, i) => `Ngày ${i + 1}`)

      stats.forEach(stat => {
        const day = parseInt(stat.dateValue, 10)
        const index = day - 1
        result.totalStudentsData[index] = parseInt(stat.totalStudents, 10)
        result.totalRevenueData[index] = parseFloat(stat.totalRevenue)
      })
    }

    else if (type === 'month') {
      result.totalStudentsData = Array(12).fill(0)
      result.totalRevenueData = Array(12).fill(0)
      result.labels = [
        'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
      ]

      stats.forEach(stat => {
        const month = parseInt(stat.dateValue, 10)
        const index = month - 1
        result.totalStudentsData[index] = parseInt(stat.totalStudents, 10)
        result.totalRevenueData[index] = parseFloat(stat.totalRevenue)
      })
    }

    res.json({
      teacherId: actualTeacherId,
      labels: result.labels,
      totalStudentsData: result.totalStudentsData,
      totalRevenueData: result.totalRevenueData
    })
  } catch (error) {
    console.error('Error fetching teacher statistics:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Lấy các thống kê tổng quan của giáo viên
router.get('/teacherStatistics', isAuthenticated, async (req, res) => {
  const { teacherId } = req.query
  const userId = req.user.id
  const actualTeacherId = teacherId || userId

  try {
    const whereCondition = {
      '$Course.assignedBy$': actualTeacherId,
      '$Course.status$': { [Op.gte]: 0 }
    }

    const stats = await models.Enrollment.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('Enrollment.id')), 'totalEnrollments'],
        [sequelize.fn('AVG', sequelize.col('Enrollment.rating')), 'averageRating'],
        [sequelize.fn('SUM', sequelize.col('Course.price')), 'totalRevenue'],
        [sequelize.fn('COUNT', sequelize.col('Enrollment.rating')), 'totalRatings'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('Order.userId'))), 'uniqueStudents']
      ],
      include: [
        {
          model: models.Course,
          attributes: [],
          where: { status: { [Op.in]: [2, 3, 4, 5, 6, 7] } }
        },
        {
          model: models.Order,
          attributes: []
        }
      ],
      where: whereCondition,
      raw: true
    })

    const totalCourses = await models.Course.count({
      where: {
        assignedBy: actualTeacherId,
        status: { [Op.in]: [2, 3, 4, 5, 6, 7] }
      }
    })

    if (stats.length === 0) {
      return res.status(404).json({ message: 'No data found' })
    }

    const result = {
      uniqueStudents: stats[0].uniqueStudents,
      totalEnrollments: parseInt(stats[0].totalEnrollments, 10),
      totalRevenue: parseFloat(stats[0].totalRevenue),
      averageRating: parseFloat(stats[0].averageRating ?? 0).toFixed(1),
      totalRatings: parseInt(stats[0].totalRatings, 10),
      totalCourses
    }

    res.json({
      teacherId: actualTeacherId,
      ...result
    })
  } catch (error) {
    console.error('Error fetching teacher statistics:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
