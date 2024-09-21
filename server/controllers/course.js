/* eslint-disable no-unused-vars */
const express = require('express')
const { models } = require('../models')
const { sequelize } = require('../models')
const { isAuthenticated } = require('../middlewares/authentication')
const jsonError = 'Internal server error'
const router = express.Router()
const { infoLogger, errorLogger } = require('../logs/logger')
const { Op } = require('sequelize')
const CategoryCourse = require('../models/category_course')

function logError (req, error) {
  const request = req.body.data ? req.body.data : (req.params ? req.params : req.query)
  errorLogger.error({
    message: `Error ${req.path}`,
    method: req.method,
    endpoint: req.path,
    request,
    error: error.message,
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

router.get('/getAllCourse', isAuthenticated, async (req, res) => {
  try {
    const courses = await models.Course.findAll({
      attributes: ['id', 'name']
    })
    logInfo(req, courses)
    res.json(courses)
  } catch (err) {
    logError(req, err)
    console.error(err)
    res.status(500).json({ message: jsonError })
  }
})

router.get('/getNewCourse', isAuthenticated, async (req, res) => {
  try {
    const {
      page = '1',
      size = '4'
    } = req.query

    const limit = parseInt(size)
    const offset = (parseInt(page) - 1) * limit

    const listCourses = await models.Course.findAll({
      offset,
      limit,
      order: [['createdAt', 'DESC']]
    })

    const listUsers = await models.User.findAll()
    const categoryCourse = await getCourseCategory()
    const enrollmentCounts = await models.Enrollment.count({
      group: ['courseId']
    })

    const enrollmentCountsObject = enrollmentCounts.reduce((obj, count) => {
      obj[count.courseId] = count.count
      return obj
    }, {})

    const lessonCounts = await Promise.all(listCourses.map(async (course) => {
      const listLessonCategories = await models.CategoryLession.findAll({
        where: { courseId: course.id },
        include: [{
          model: models.Lession,
          attributes: ['id']
        }]
      })

      const lessonCount = listLessonCategories.reduce((sum, lessonCategory) => {
        return sum + lessonCategory.Lessions.length
      }, 0)

      return { courseId: course.id, count: lessonCount }
    }))

    const lessonCountsObject = lessonCounts.reduce((obj, count) => {
      obj[count.courseId] = count.count
      return obj
    }, {})

    const dataFromDatabase = listCourses.map((course) => ({
      id: course.id,
      name: course.name,
      summary: course.summary,
      assignedBy: listUsers?.find((e) => course.assignedBy === e.id)?.username ?? null,
      durationInMinute: course.durationInMinute,
      startDate: course.startDate,
      endDate: course.endDate,
      description: course.description,
      price: course.price,
      prepare: course.prepare,
      locationPath: course.locationPath,
      categoryCourseName: categoryCourse?.find((e) => course.categoryCourseId === e.id)?.name ?? null,
      enrollmentCount: enrollmentCountsObject[course.id] || 0,
      lessonCount: lessonCountsObject[course.id] || 0,
      createdAt: course.createdAt
    }))

    // Logging and response
    infoLogger.info({
      message: `Accessed ${req.path}`,
      method: req.method,
      endpoint: req.path,
      request: req.query,
      response: dataFromDatabase,
      user: req.user.id
    })

    const totalRecords = await models.Course.count() // total number of courses in the database

    res.json({
      page: Number(page),
      size: Number(size),
      totalRecords,
      data: dataFromDatabase
    })
  } catch (error) {
    console.log(error)
    logError(req, error)
    res.status(500).json({ message: jsonError })
  }
})
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const {
      page = '1',
      size = '8',
      search: searchCondition,
      startDate = '1970-01-01',
      endDate = '9999-12-31',
      category: categoryCondition
    } = req.query
    const offset = (Number(page) - 1) * Number(size)

    const searchConditions = {
      where: {}
    }
    if (searchCondition) {
      searchConditions.where.name = {
        [Op.like]: `%${searchCondition}%`
      }
    }
    if (startDate && endDate) {
      searchConditions.where.startDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      }
    }
    if (categoryCondition && categoryCondition !== 'all') {
      searchConditions.where.categoryCourseId = categoryCondition
    }
    // Fetch the total count of courses with filtering conditions
    const totalRecords = await models.Course.count(searchConditions)

    // Fetch the courses with limit and offset
    const listCourses = await models.Course.findAll({
      ...searchConditions,
      limit: Number(size),
      offset
    })

    // Lấy rating trung bình của mỗi khóa học
    const ratings = await models.CourseReview.findAll({
      attributes: [
        'courseId',
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating']
      ],
      group: ['courseId']
    })

    // Chuyển đổi kết quả thành đối tượng dễ tìm kiếm
    const ratingsObject = ratings.reduce((acc, curr) => {
      const courseId = curr.getDataValue('courseId') // Lấy courseId
      const averageRating = parseFloat(curr.getDataValue('averageRating')) // Lấy averageRating
      acc[courseId] = averageRating || 0 // Gán giá trị averageRating vào đối tượng
      return acc
    }, {})

    const listUsers = await models.User.findAll()
    const categoryCourse = await getCourseCategory()
    const enrollmentCounts = await models.Enrollment.count({
      group: ['courseId']
    })
    const enrollmentCountsObject = enrollmentCounts.reduce((obj, count) => {
      obj[count.courseId] = count.count
      return obj
    }, {})
    const lessonCounts = await Promise.all(listCourses.map(async (course) => {
      const listLessonCategories = await models.CategoryLession.findAll({
        where: { courseId: course.id },
        include: [{
          model: models.Lession,
          attributes: ['id']
        }]
      })
      const lessonCount = listLessonCategories.reduce((sum, lessonCategory) => {
        return sum + lessonCategory.Lessions.length
      }, 0)
      return { courseId: course.id, count: lessonCount }
    }))
    const lessonCountsObject = lessonCounts.reduce((obj, count) => {
      obj[count.courseId] = count.count
      return obj
    }, {})
    const dataFromDatabase = listCourses.map((course) => {
      const rating = ratingsObject[course.id] || 0 // Lấy rating từ ratingsObject
      return {
        id: course.id,
        name: course.name,
        summary: course.summary,
        assignedBy: listUsers?.find((e) => course.assignedBy === e.id)?.username ?? null,
        durationInMinute: course.durationInMinute,
        startDate: course.startDate,
        endDate: course.endDate,
        description: course.description,
        price: course.price,
        prepare: course.prepare,
        locationPath: course.locationPath,
        categoryCourseName: categoryCourse?.find((e) => course.categoryCourseId === e.id)?.name ?? null,
        enrollmentCount: enrollmentCountsObject[course.id] || 0,
        lessonCount: lessonCountsObject[course.id] || 0,
        averageRating: rating, // Gán giá trị averageRating
        createdAt: course.createdAt
      }
    })
      .sort((a, b) => {
        if (b.enrollmentCount - a.enrollmentCount !== 0) {
          return b.enrollmentCount - a.enrollmentCount
        } else {
          return new Date(b.createdAt) - new Date(a.createdAt)
        }
      })
    console.log(dataFromDatabase.length, 'dataFromDatabase')
    const dataAfterNameSearch = applyNameSearch(searchCondition, dataFromDatabase)
    console.log(dataAfterNameSearch.length, 'dataAfterNameSearch')
    const dataAfterNameAndDateSearch = applyDateRangeSearch(startDate, endDate, dataAfterNameSearch)
    console.log(dataAfterNameAndDateSearch.length, 'dataAfterNameAndDateSearch')
    const dataAfterSearch = applyCourseCategoryNameSearch(categoryCondition, dataAfterNameAndDateSearch)
    console.log(dataAfterSearch.length, 'dataAfterSearch')
    console.log(totalRecords, 'totalRecords')
    infoLogger.info({
      message: `Accessed ${req.path}`,
      method: req.method,
      endpoint: req.path,
      request: req.query,
      response: dataAfterSearch,
      user: req.user.id
    })
    res.json({
      page: Number(page),
      size: Number(size),
      totalRecords,
      data: dataAfterSearch
    })
  } catch (error) {
    console.log(error)
    logError(req, error)
    res.status(500).json({ message: jsonError })
  }
})

function applyDateRangeSearch (startDate, endDate, inputData) {
  const filteredData = inputData.filter((d) => {
    return new Date(d.startDate) >= new Date(startDate) && new Date(d.endDate) <= new Date(endDate)
  })
  return filteredData
}
router.get('/course-category', isAuthenticated, async (req, res) => {
  try {
    const courseCategory = await getCourseCategory()
    infoLogger.info({
      message: `Accessed ${req.path}`,
      method: req.method,
      endpoint: req.path,
      request: req.query,
      response: courseCategory,
      user: req.user.id
    })
    res.json(courseCategory)
  } catch (error) {
    logError(req, error)
    console.log(error)
    res.status(500).json({ message: jsonError })
  }
})

router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params
    const course = await models.Course.findByPk(id)
    const categoryCourse = await getCourseCategory()
    const response = {
      ...course.toJSON(),
      categoryCourseName: categoryCourse?.find((e) => course.categoryCourseId === e.id)?.name ?? null
    }
    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }
    infoLogger.info({
      message: `Accessed ${req.path}`,
      method: req.method,
      endpoint: req.path,
      request: req.params,
      response: course,
      user: req.user.id
    })
    res.json(response)
  } catch (error) {
    logError(req, error)
    res.status(500).json({ message: 'Failed to fetch course', error: error.message })
  }
})

function applyNameSearch (searchCondition, data) {
  if (searchCondition) {
    data = data.filter(
      (d) => d.name?.toLowerCase()?.indexOf(searchCondition.toLowerCase()) >= 0
    )
  }
  return data
}

function applyCourseCategoryNameSearch (categoryID, data) {
  console.log(categoryID, 'courseName')
  console.log(data, 'data')

  if (categoryID === 'all' || !categoryID) {
    return data
  } else {
    const category = CategoryCourse.findByPk(categoryID)
    const categoryName = category ? category.name : ''

    if (categoryName) {
      data = data.filter(
        (d) => d.categoryCourseName?.toLowerCase()?.indexOf(categoryName.toLowerCase()) >= 0
      )
    }
    return data
  }
}
function getDataInWindowSize (size, page, data) {
  if (!isNaN(Number(size)) && !isNaN(Number(page))) {
    data = data.slice(
      Number(size) * (Number(page) - 1),
      Number(size) * Number(page)
    )
  }
  return data
}

async function getCourseCategory () {
  return await models.CategoryCourse.findAll({
    order: [['id', 'DESC']]
  })
}

module.exports = router
