/* eslint-disable no-unused-vars */
const express = require('express')
const { models } = require('../models')
const { sequelize } = require('../models')
const { isAuthenticated } = require('../middlewares/authentication')
const jsonError = 'Internal server error'
const router = express.Router()
// const { INTEGER } = require('sequelize')
const { Op, fn, col } = require('sequelize')
const CategoryCourse = require('../models/category_course')
const StudyItem = require('../models/study_item')
const { duration } = require('moment-timezone')

/*****************************
 * ROUTES FOR COURSE
 *****************************/

router.get('/getAllCourseInfo', isAuthenticated, async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const offset = (page - 1) * limit

  const { categoryCourseId, status, priceMin, priceMax, durationMin, durationMax, name } = req.query

  const whereConditions = {}

  if (categoryCourseId) {
    whereConditions.categoryCourseId = categoryCourseId
  }

  if (status) {
    if ([5, 6, 7].includes(Number(status))) {
      whereConditions.status = { [Op.in]: [5, 6, 7] }
    } else if (status) {
      whereConditions.status = status
    }
  }

  if (priceMin || priceMax) {
    whereConditions.price = {}
    if (priceMin) {
      whereConditions.price[Op.gte] = priceMin
    }
    if (priceMax) {
      whereConditions.price[Op.lte] = priceMax
    }
  }

  if (durationMin || durationMax) {
    whereConditions.durationInMinute = {}
    if (durationMin) {
      whereConditions.durationInMinute[Op.gte] = durationMin
    }
    if (durationMax) {
      whereConditions.durationInMinute[Op.lte] = durationMax
    }
  }

  if (name) {
    whereConditions.name = {
      [Op.and]: [
        { [Op.like]: `%${name}%` },
        { [Op.not]: null }
      ]
    }
  }
  console.log('Where Conditions:', whereConditions)

  try {
    const { count, rows } = await models.Course.findAndCountAll({
      where: whereConditions,
      limit,
      offset,
      attributes: ['id', 'categoryCourseId', 'name', 'durationInMinute', 'locationPath', 'price', 'status']
    })

    const totalPages = Math.ceil(count / limit)

    res.status(200).json({
      totalItems: count,
      totalPages: count !== 0 ? totalPages : 1,
      currentPage: page,
      courses: rows
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: jsonError })
  }
})

router.get('/getAllCourseByTeacher', isAuthenticated, async (req, res) => {
  const { teacherId } = req.query
  const teacherIdToUse = teacherId || req.user.id

  try {
    const courses = await models.Course.findAll({
      where: { assignedBy: teacherIdToUse },
      attributes: ['id', 'categoryCourseId', 'name', 'durationInMinute', 'locationPath', 'price', 'status']
    })

    res.status(200).json(courses)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi khi lấy dữ liệu giáo viên và khóa học' })
  }
})

router.get('/getCourseById/:courseId', isAuthenticated, async (req, res) => {
  try {
    const { courseId } = req.params

    if (!courseId) {
      return res.status(400).json({ message: 'Thiếu id của khóa học' })
    }

    const course = await models.Course.findOne({
      where: { id: courseId }
    })

    if (!course) {
      return res.status(404).json({ message: 'Không tìm thấy khóa học' })
    }

    res.status(200).json(course)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi hệ thống, vui lòng thử lại sau.' })
  }
})

router.post('/createNewCourse', isAuthenticated, async (req, res) => {
  try {
    const {
      categoryCourseId,
      name
    } = req.body

    console.log('Request Body:', req.body)
    if (!name) {
      return res.status(400).json({ error: 'Required fields are missing' })
    }

    const newCourse = await models.Course.create({
      categoryCourseId,
      name,
      assignedBy: req.user.id,
      description: '',
      summary: '',
      prepare: ''
    })
    res.status(201).json(newCourse)
  } catch (error) {
    res.status(500).json({ error: jsonError })
  }
})

// Sửa thông tin course
router.put('/editCourse/:courseId', isAuthenticated, async (req, res) => {
  const { courseId } = req.params
  const {
    categoryCourseId,
    name,
    summary,
    startDate,
    endDate,
    description,
    locationPath,
    videoLocationPath,
    prepare,
    price,
    status
  } = req.body

  console.log('Request Body:', req.body)

  try {
    const course = await models.Course.findByPk(courseId)

    if (!course) {
      return res.status(404).json({ error: 'Course not found' })
    }

    await course.update({
      categoryCourseId,
      name,
      summary,
      startDate,
      endDate,
      description,
      locationPath,
      videoLocationPath,
      prepare,
      price,
      status
    })

    res.status(200).json(course)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Thay đổi status khóa học cho admin
router.put('/acceptOrDeclineCourseStatus/:courseId', isAuthenticated, async (req, res) => {
  const { courseId } = req.params
  const { status, resuft } = req.body

  const transaction = await sequelize.transaction()
  try {
    // Tính thời lương tổng các video
    const totalDuration = await calculateTotalCourseDuration(courseId)
    console.log(`Tổng thời gian khóa học ${courseId}: ${totalDuration} giây`)
    let course
    if (resuft) {
      course = await models.Course.findByPk(courseId, {
        attributes: ['id', 'status'],
        include: [
          {
            model: models.CategoryLession,
            attributes: ['id'],
            include: [
              {
                model: models.StudyItem,
                attributes: ['id', 'status']
              }
            ]
          }
        ],
        transaction
      })

      if (!course) {
        return res.status(404).json({ error: 'Course not found' })
      }

      const startDate = course.status === 1 ? Date.now() : null

      await models.Course.update({ status, durationInMinute: totalDuration, startDate }, {
        where: {
          id: courseId
        },
        transaction
      })

      // Cập nhật status các StudyItems
      if (course.CategoryLessions && Array.isArray(course.CategoryLessions)) {
        const studyItemsToUpdate = []

        course.CategoryLessions.forEach(category => {
          if (category.StudyItems && Array.isArray(category.StudyItems)) {
            category.StudyItems.forEach(studyItem => {
              studyItemsToUpdate.push(studyItem.id)
            })
          }
        })

        if (studyItemsToUpdate.length > 0) {
          await models.StudyItem.update(
            { status: 1 },
            {
              where: {
                id: studyItemsToUpdate
              },
              transaction
            }
          )
        }
      } else {
        console.log('No LessonCategories found for this course.')
      }
    } else {
      course = await models.Course.update({ status }, {
        where: { id: courseId }
      })
    }

    await transaction.commit()
    res.status(200).json({ message: 'Status updated successfully', course })
  } catch (error) {
    await transaction.rollback()
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Thay doi status course
router.put('/updateCourseStatus/:courseId', isAuthenticated, async (req, res) => {
  const { courseId } = req.params
  const { status, endDate } = req.body

  try {
    if (!courseId) {
      return res.status(400).json({ error: 'Course ID is required' })
    }
    if (typeof status === 'undefined') {
      return res.status(400).json({ error: 'Status is required' })
    }

    try {
      // Kiểm tra các giá trị đặc biệt của status
      if ([1, 5, 6, 7].includes(status)) {
        const isValid = await isCourseValidForStatus(courseId)
        if (!isValid) {
          return res.status(400).json({ error: 'Course does not meet the required conditions for this status' })
        }
      }

      await models.Course.update({ status, endDate }, {
        where: { id: courseId }
      })

      res.status(200).json({
        message: 'Status updated successfully',
        data: {
          courseId,
          status,
          endDate,
          updatedAt: new Date()
        }
      })
    } catch (error) {
      res.status(500).json({ error: 'Internal server error during transaction' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

async function calculateTotalCourseDuration (courseId) {
  try {
    const sql = `
          SELECT SUM(L.durationInSecond) AS totalDuration
          FROM courses AS C
          LEFT JOIN category_lession AS CL ON C.id = CL.courseId
          LEFT JOIN study_items AS SI ON CL.id = SI.lessionCategoryId
          LEFT JOIN lessions AS L ON SI.id = L.studyItemId
          WHERE C.id = :courseId
          GROUP BY C.id
      `

    const [results] = await sequelize.query(sql, {
      replacements: { courseId },
      type: sequelize.QueryTypes.SELECT
    })

    return results.totalDuration
  } catch (error) {
    console.error('Error calculating total course duration:', error)
    return 0 // Trả về 0 nếu có lỗi
  }
}

// Lấy tất cả categoryLession theo khóa học
router.get('/getCategoryLessionByCourse/:courseId', isAuthenticated, async (req, res) => {
  try {
    const { courseId } = req.params
    const categories = await models.CategoryLession.findAll({
      where: { courseId },
      order: [['order', 'ASC']]
    })

    res.status(200).json(categories)
  } catch (error) {
    res.status(500).json({ error: jsonError })
  }
})

// Tạo categorylession
router.post('/createCategoryLession', isAuthenticated, async (req, res) => {
  try {
    const { courseId, name, order, status } = req.body
    console.log('Request body:', req.body)

    if (!courseId || !name || typeof order === 'undefined') {
      return res.status(400).json({ error: 'Missing required fields: courseId, name, or order' })
    }

    const newCategoryLession = await models.CategoryLession.create({
      courseId,
      name,
      order,
      status: typeof status !== 'undefined' ? status : 0
    })

    return res.status(201).json(newCategoryLession)
  } catch (error) {
    return res.status(500).json({ error: jsonError })
  }
})

// Sửa categorylession
router.post('/updateCategoryLession', isAuthenticated, async (req, res) => {
  try {
    const { categoryLession } = req.body

    if (!categoryLession || !categoryLession.id) {
      return res.status(400).json({ error: 'CategoryLession data or ID is missing' })
    }

    const [updated] = await models.CategoryLession.update(categoryLession, {
      where: { id: categoryLession.id }
    })

    if (updated === 0) {
      return res.status(404).json({ error: 'CategoryLession not found' })
    }

    res.status(200).json(categoryLession)
  } catch (error) {
    res.status(500).json({ error: jsonError })
  }
})

// Thay đổi thứ tự category lession
router.put('/updateCategoryLessionOrder', isAuthenticated, async (req, res) => {
  const oldOrder = Number(req.body.oldOrder)
  const newOrder = Number(req.body.newOrder)
  const lessionCategoryId = Number(req.body.lessionCategoryId)
  const courseId = Number(req.body.courseId)
  const updatedAt = req.body.updatedAt

  console.log(lessionCategoryId, oldOrder, newOrder, courseId)
  if (lessionCategoryId == null || oldOrder == null || newOrder == null || courseId == null) {
    return res.status(400).json({ error: 'Missing or null input' })
  }
  const catagoryLession = await models.CategoryLession.findOne({
    where: { id: lessionCategoryId, courseId }
  })

  if (!catagoryLession) {
    return res.status(404).json({ error: 'Study item not found' })
  }

  if (catagoryLession.updatedAt.getTime() !== new Date(updatedAt).getTime()) {
    return res.status(409).json({ error: 'Conflict: The item has been modified by another user.' })
  }
  const transaction = await sequelize.transaction()

  try {
    // Nếu newOrder nhỏ hơn oldOrder => Các mục giữa oldOrder và newOrder sẽ được tăng lên 1
    if (newOrder < oldOrder) {
      await models.CategoryLession.increment('order', {
        by: 1,
        where: {
          order: { [Op.between]: [newOrder, oldOrder - 1] },
          courseId
        },
        transaction
      })
    } else if (newOrder > oldOrder) {
      // Nếu newOrder lớn hơn oldOrder => Các mục giữa oldOrder và newOrder sẽ được giảm đi 1
      await models.CategoryLession.decrement('order', {
        by: 1,
        where: {
          order: { [Op.between]: [oldOrder + 1, newOrder] },
          courseId
        },
        transaction
      })
    }

    await models.CategoryLession.update(
      { order: newOrder },
      {
        where: { id: lessionCategoryId },
        transaction
      }
    )

    await transaction.commit()
    res.status(200).json({ message: 'Study item order updated successfully' })
  } catch (error) {
    await transaction.rollback()
    res.status(500).json({ error: 'An error occurred while updating study item order' })
  }
})

// Lấy studyItem theo categoryLession
router.get('/getStudyItemByCategoryLessionId/:lessionCategoryId', isAuthenticated, async (req, res) => {
  try {
    const { lessionCategoryId } = req.params
    const studyItemDetails = await models.StudyItem.findAll({
      where: { lessionCategoryId },
      order: [['order', 'ASC']],
      include: [
        {
          model: models.Exam,
          where: { studyItemId: sequelize.col('StudyItem.id') },
          required: false
        },
        {
          model: models.Lession,
          where: { studyItemId: sequelize.col('StudyItem.id') },
          required: false
        }
      ]
    })

    if (!studyItemDetails) {
      return res.status(404).json({ error: 'StudyItem not found' })
    }

    res.status(200).json(studyItemDetails)
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching study item details' })
  }
})

router.put('/updateStudyItemOrder', isAuthenticated, async (req, res) => {
  const oldOrder = Number(req.body.oldOrder)
  const newOrder = Number(req.body.newOrder)
  const studyItemId = Number(req.body.studyItemId)
  const lessionCategoryId = Number(req.body.lessionCategoryId)
  const updatedAt = req.body.updatedAt

  console.log(studyItemId, oldOrder, newOrder, lessionCategoryId)
  if (studyItemId == null || oldOrder == null || newOrder == null || lessionCategoryId == null | updatedAt == null) {
    return res.status(400).json({ error: 'Missing or null input' })
  }

  const transaction = await sequelize.transaction()

  try {
    const studyItem = await models.StudyItem.findOne({
      where: { id: studyItemId, lessionCategoryId }
    })

    if (!studyItem) {
      return res.status(404).json({ error: 'Study item not found' })
    }

    if (studyItem.updatedAt.getTime() !== new Date(updatedAt).getTime()) {
      return res.status(409).json({ error: 'Conflict: The item has been modified by another user.' })
    }
    // Nếu newOrder nhỏ hơn oldOrder => Các mục giữa oldOrder và newOrder sẽ được tăng lên 1
    if (newOrder < oldOrder) {
      await models.StudyItem.increment('order', {
        by: 1,
        where: {
          order: { [Op.between]: [newOrder, oldOrder - 1] },
          lessionCategoryId
        },
        transaction
      })
    } else if (newOrder > oldOrder) {
      // Nếu newOrder lớn hơn oldOrder => Các mục giữa oldOrder và newOrder sẽ được giảm đi 1
      await models.StudyItem.decrement('order', {
        by: 1,
        where: {
          order: { [Op.between]: [oldOrder + 1, newOrder] },
          lessionCategoryId
        },
        transaction
      })
    }

    await models.StudyItem.update(
      { order: newOrder },
      {
        where: { id: studyItemId },
        transaction
      }
    )

    await transaction.commit()
    res.status(200).json({ message: 'Study item order updated successfully' })
  } catch (error) {
    await transaction.rollback()
    res.status(500).json({ error: 'An error occurred while updating study item order' })
  }
})

// -----------------------------------------------trang my course ----------------------------
router.get('/myCoursesDone', isAuthenticated, async (req, res) => {
  try {
    const loginedUserId = req.user.id
    const {
      page = '1',
      size = '8',
      search: searchCondition,
      startDate = '1970-01-01',
      endDate = '9999-12-31',
      category: categoryCondition
    } = req.query

    // Lấy dữ liệu cần thiết bằng cách tối ưu hóa các truy vấn
    const [allCourses, allUsers, orders, categoryCourse, enrollmentCounts, lessonCounts] = await Promise.all([
      models.Course.findAll(),
      models.User.findAll(),
      models.Order.findAll({ where: { userId: loginedUserId, status: 1 }, attributes: ['id'] }), // Fix_1001
      getCourseCategory(),
      models.Enrollment.count({ where: { status: 1 }, group: ['courseId'] }), // Đếm số lượng Enrollment với status là 1 // Fix_1001
      fetchLessonCounts()
    ])

    // Lấy danh sách orderId từ orders
    const orderIds = orders.map(order => order.id)

    // Truy vấn tất cả các Enrollment bằng orderIds và kiểm tra status // Fix_1001
    const enrollments = await models.Enrollment.findAll({
      where: { orderId: orderIds, status: 1 },
      order: [['id', 'DESC']]
    })

    const filteredCourses = allCourses.filter(course =>
      enrollments.some(enrollment => enrollment.courseId === course.id)
    )

    const enrollmentCountsObject = arrayToObject(enrollmentCounts, 'courseId', 'count')
    const lessonCountsObject = arrayToObject(lessonCounts, 'courseId', 'count')

    const userEnrollments = await models.Enrollment.findAll({
      where: {
        orderId: orderIds,
        courseId: filteredCourses.map(course => course.id),
        status: 1
      }
    })

    const courseProgressCountsObject = await fetchCourseProgressCounts(userEnrollments)

    const dataFromDatabase = transformCourseDataDone(filteredCourses, allUsers, categoryCourse, enrollmentCountsObject, lessonCountsObject, courseProgressCountsObject)

    const dataAfterSearch = applyFilters(dataFromDatabase, searchCondition, startDate, endDate, categoryCondition)
    const dataOfCurrentWindow = paginateData(dataAfterSearch, size, page)

    res.json({
      page: Number(page),
      size: Number(size),
      totalRecords: dataAfterSearch.length,
      data: dataOfCurrentWindow
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách khóa học.' })
  }
})

router.get('/myCoursesActive', isAuthenticated, async (req, res) => {
  try {
    const loginedUserId = req.user.id
    const {
      page = '1',
      size = '8',
      search: searchCondition,
      startDate = '1970-01-01',
      endDate = '9999-12-31',
      category: categoryCondition
    } = req.query

    // Lấy dữ liệu cần thiết bằng cách tối ưu hóa các truy vấn
    const [allCourses, allUsers, orders, categoryCourse, enrollmentCounts, lessonCounts] = await Promise.all([
      models.Course.findAll(),
      models.User.findAll(),
      models.Order.findAll({ where: { userId: loginedUserId, status: 1 }, attributes: ['id'] }), // Fix_1001
      getCourseCategory(),
      models.Enrollment.count({ where: { status: 1 }, group: ['courseId'] }), // Đếm số lượng Enrollment với status là 1 // Fix_1001
      fetchLessonCounts()
    ])

    // Lấy danh sách orderId từ orders
    const orderIds = orders.map(order => order.id)

    // Truy vấn tất cả các Enrollment bằng orderIds và kiểm tra status // Fix_1001
    const enrollments = await models.Enrollment.findAll({
      where: { orderId: orderIds, status: 1 }, // Fix_1001
      order: [['id', 'DESC']]
    })

    const filteredCourses = allCourses.filter(course =>
      enrollments.some(enrollment => enrollment.courseId === course.id)
    )

    const enrollmentCountsObject = arrayToObject(enrollmentCounts, 'courseId', 'count')
    const lessonCountsObject = arrayToObject(lessonCounts, 'courseId', 'count')

    const userEnrollments = await models.Enrollment.findAll({
      where: {
        orderId: orderIds,
        courseId: filteredCourses.map(course => course.id),
        status: 1
      }
    })

    const courseProgressCountsObject = await fetchCourseProgressCounts(userEnrollments)

    const dataFromDatabase = transformCourseDataNotDone(filteredCourses, allUsers, categoryCourse, enrollmentCountsObject, lessonCountsObject, courseProgressCountsObject)

    const dataAfterSearch = applyFilters(dataFromDatabase, searchCondition, startDate, endDate, categoryCondition)
    const dataOfCurrentWindow = paginateData(dataAfterSearch, size, page)

    res.json({
      page: Number(page),
      size: Number(size),
      totalRecords: dataAfterSearch.length,
      data: dataOfCurrentWindow
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách khóa học.' })
  }
})

router.get('/myCourses', isAuthenticated, async (req, res) => {
  try {
    const loginedUserId = req.user.id
    const {
      page = '1',
      size = '8',
      search: searchCondition,
      startDate = '1970-01-01',
      endDate = '9999-12-31',
      category: categoryCondition
    } = req.query

    // Lấy dữ liệu cần thiết bằng cách tối ưu hóa các truy vấn
    const [allCourses, allUsers, orders, categoryCourse, enrollmentCounts, lessonCounts] = await Promise.all([
      models.Course.findAll(),
      models.User.findAll(),
      models.Order.findAll({ where: { userId: loginedUserId, status: 1 }, attributes: ['id'] }), // Fix_1001
      getCourseCategory(),
      models.Enrollment.count({ where: { status: 1 }, group: ['courseId'] }), // Đếm số lượng Enrollment với status là 1 // Fix_1001
      fetchLessonCounts()
    ])

    // Lấy danh sách orderId từ orders
    const orderIds = orders.map(order => order.id)

    // Truy vấn tất cả các Enrollment bằng orderIds và kiểm tra status
    const enrollments = await models.Enrollment.findAll({
      where: { orderId: orderIds, status: 1 },
      order: [['id', 'DESC']]
    })

    const filteredCourses = allCourses.filter(course =>
      enrollments.some(enrollment => enrollment.courseId === course.id)
    )

    const enrollmentCountsObject = arrayToObject(enrollmentCounts, 'courseId', 'count')
    const lessonCountsObject = arrayToObject(lessonCounts, 'courseId', 'count')

    const userEnrollments = await models.Enrollment.findAll({
      where: {
        orderId: orderIds,
        courseId: filteredCourses.map(course => course.id), // Fix_1001
        status: 1 // Fix_1001
      }
    })

    const courseProgressCountsObject = await fetchCourseProgressCounts(userEnrollments)
    // chỗ này sẽ quyết định status là true hay false dựa vào việc đếm số bài học đã hoàn thành và số bài học trong khóa học chứ không dựa vào cột status trong bảng Enrollment // Fix_1001
    const dataFromDatabase = transformCourseData(filteredCourses, allUsers, categoryCourse, enrollmentCountsObject, lessonCountsObject, courseProgressCountsObject)

    const dataAfterSearch = applyFilters(dataFromDatabase, searchCondition, startDate, endDate, categoryCondition)
    const dataOfCurrentWindow = paginateData(dataAfterSearch, size, page)

    res.json({
      page: Number(page),
      size: Number(size),
      totalRecords: dataAfterSearch.length,
      data: dataOfCurrentWindow
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách khóa học.' })
  }
})
// ---------------------------------------------------------------------------------------------------------

// trang home page
// đã fix
router.get('/getNewCourse', async (req, res) => {
  try {
    const {
      page = '1',
      size = '4'
    } = req.query

    const limit = parseInt(size)
    const offset = (parseInt(page) - 1) * limit

    const searchConditions = {
      where: {
        status: {
          [Op.in]: [2, 3] // Chỉ lấy các khóa học có status là 2 hoặc 3
        }
      },
      offset,
      limit,
      order: [['createdAt', 'DESC']]
    }

    const listCourses = await models.Course.findAll(searchConditions)

    const listUsers = await models.User.findAll()
    const categoryCourse = await getCourseCategory()
    const enrollmentCounts = await models.Enrollment.count({
      group: ['courseId'], // Fix_1001
      where: { status: 1 } // Check status of enrollment // Fix_1001
    })

    const enrollmentCountsObject = enrollmentCounts.reduce((obj, count) => {
      obj[count.courseId] = count.count
      return obj
    }, {})

    const lessonCounts = await Promise.all(listCourses.map(async (course) => {
      const listLessonCategories = await models.CategoryLession.findAll({
        where: { courseId: course.id },
        include: [{
          model: StudyItem, // Liên kết từ CategoryLession đến StudyItem
          include: [{
            model: models.Lession, // Liên kết từ StudyItem đến Lession
            attributes: ['studyItemId'] // Chỉ lấy trường studyItemId
          }]
        }]
      })
      const lessonCount = listLessonCategories.reduce((sum, lessonCategory) => {
        return sum + lessonCategory.StudyItems.length
      }, 0)

      return { courseId: course.id, count: lessonCount }
    }))

    const lessonCountsObject = lessonCounts.reduce((obj, count) => {
      obj[count.courseId] = count.count
      return obj
    }, {})

    // Lấy rating trung bình của mỗi khóa học từ bảng Enrollment
    const ratings = await models.Enrollment.findAll({
      attributes: [
        'courseId',
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating']
      ],
      where: {
        rating: {
          [Op.ne]: null // Chỉ lấy các bản ghi có rating khác null
        },
        status: 1 // Check status of enrollment // Fix_1001
      },
      group: ['courseId']
    })

    // Chuyển đổi kết quả thành đối tượng dễ tìm kiếm
    const ratingsObject = ratings.reduce((acc, curr) => {
      const courseId = curr.getDataValue('courseId') // Lấy courseId
      const averageRating = parseFloat(curr.getDataValue('averageRating')) // Lấy averageRating
      acc[courseId] = averageRating || 0 // Gán giá trị averageRating vào đối tượng
      return acc
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

    const totalRecords = await models.Course.count({
      where: {
        status: {
          [Op.in]: [2, 3] // Chỉ lấy các khóa học có status là 2 hoặc 3
        }
      }
    }) // total number of courses in the database

    res.json({
      page: Number(page),
      size: Number(size),
      totalRecords,
      data: dataFromDatabase
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: jsonError })
  }
})

// đã fix - v2 fix
router.get('/', async (req, res) => {
  try {
    const {
      page = '1',
      size = '8',
      search: searchCondition,
      startDate,
      endDate,
      category: categoryCondition
    } = req.query
    console.log('Query:', req.query)
    const offset = (Number(page) - 1) * Number(size)

    // Điều kiện lọc cơ bản
    const searchConditions = {
      where: {
        [Op.or]: [
          // Status = 2: Public courses (không bị ảnh hưởng bởi ngày)
          { status: 2 },
          // Status = 3: Time-based courses (phải kiểm tra đã public)
          // {
          //   status: 3,
          //   startDate: {
          //     [Op.lte]: new Date() // Khóa học đã public
          //   },
          //   endDate: {
          //     [Op.gte]: new Date() // Chưa hết hạn
          //   }
          // }
          {
            status: 3, // Private courses, cần kiểm tra thời gian
            startDate: { [Op.lte]: new Date() }, // Khóa học đã public
            [Op.or]: [
              { endDate: { [Op.gte]: new Date() } }, // Chưa hết hạn
              { endDate: null } // Không có thời hạn kết thúc
            ]
          }
        ]
      }
    }

    // Lọc theo khoảng thời gian nếu có cả startDate và endDate
    if (startDate && endDate) {
      searchConditions.where[Op.or][1] = {
        ...searchConditions.where[Op.or][1], // Áp dụng chỉ cho status = 3
        startDate: {
          [Op.and]: [
            { [Op.gte]: new Date(startDate) }, // Người dùng lọc startDate
            { [Op.lte]: new Date() } // Khóa học phải đã public
          ]
        },
        // endDate: {
        //   [Op.and]: [
        //     { [Op.lte]: new Date(endDate) }, // Kết thúc trước endDate
        //     { [Op.gte]: new Date() } // Chưa hết hạn
        //   ]
        // }
        [Op.or]: [
          {
            endDate: {
              [Op.and]: [
                { [Op.lte]: new Date(endDate) },
                { [Op.gte]: new Date() }
              ]
            }
          },
          { endDate: null } // Thêm điều kiện này
        ]
      }
    }

    // Lọc chỉ theo startDate
    if (startDate && !endDate) {
      searchConditions.where[Op.or][1] = {
        ...searchConditions.where[Op.or][1],
        startDate: {
          [Op.and]: [
            { [Op.gte]: new Date(startDate) }, // Người dùng lọc startDate
            { [Op.lte]: new Date() } // Khóa học phải đã public
          ]
        }
      }
    }

    // Lọc chỉ theo endDate
    // if (endDate && !startDate) {
    //   searchConditions.where[Op.or][1] = {
    //     ...searchConditions.where[Op.or][1],
    //     endDate: {
    //       [Op.and]: [
    //         { [Op.lte]: new Date(endDate) }, // Kết thúc trước endDate
    //         { [Op.gte]: new Date() } // Chưa hết hạn
    //       ]
    //     }
    //   }
    // }
    // Lọc chỉ theo endDate
    if (endDate && !startDate) {
      searchConditions.where[Op.or][1] = {
        ...searchConditions.where[Op.or][1],
        [Op.or]: [
          {
            endDate: {
              [Op.and]: [
                { [Op.lte]: new Date(endDate) },
                { [Op.gte]: new Date() }
              ]
            }
          },
          { endDate: null } // Thêm điều kiện này
        ]
      }
    }

    // Lọc theo danh mục
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

    // Lấy rating trung bình của mỗi khóa học từ bảng Enrollment
    const ratings = await models.Enrollment.findAll({
      attributes: [
        'courseId',
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating']
      ],
      where: {
        rating: {
          [Op.ne]: null // Chỉ lấy các bản ghi có rating khác null
        },
        status: 1 // Check status of enrollment // Fix_1001
      },
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
      group: ['courseId'],
      where: { status: 1 } // Check status of enrollment // Fix_1001
    })
    const enrollmentCountsObject = enrollmentCounts.reduce((obj, count) => {
      obj[count.courseId] = count.count
      return obj
    }, {})
    const lessonCounts = await Promise.all(listCourses.map(async (course) => {
      const listLessonCategories = await models.CategoryLession.findAll({
        where: { courseId: course.id },
        include: [{
          model: StudyItem, // Liên kết từ CategoryLession đến StudyItem
          include: [{
            model: models.Lession, // Liên kết từ StudyItem đến Lession
            attributes: ['studyItemId'] // Chỉ lấy trường studyItemId
          }]
        }]
      })
      const lessonCount = listLessonCategories.reduce((sum, lessonCategory) => {
        return sum + lessonCategory.StudyItems.length
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

    // Sắp xếp theo số lượng học viên hoặc thời gian tạo
    const sortedData = dataFromDatabase.sort((a, b) => {
      if (b.enrollmentCount - a.enrollmentCount !== 0) {
        return b.enrollmentCount - a.enrollmentCount
      } else {
        return new Date(b.createdAt) - new Date(a.createdAt)
      }
    })

    res.json({
      page: Number(page),
      size: Number(size),
      totalRecords,
      data: sortedData
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

// đã check - không cần fix
function applyDateRangeSearch (startDate, endDate, inputData) {
  const filteredData = inputData.filter((d) => {
    return new Date(d.startDate) >= new Date(startDate) && new Date(d.endDate) <= new Date(endDate)
  })
  return filteredData
}

// đã check - không cần fix
router.get('/course-category', async (req, res) => {
  try {
    const courseCategory = await getCourseCategory()
    res.json(courseCategory)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: jsonError })
  }
})

// trang course detail
// router.get('/:id', async (req, res) => {
//   try {
//     const { id } = req.params
//     const course = await models.Course.findByPk(id)
//     if (!course) {
//       return res.status(404).json({ message: 'Course not found' })
//     }
//     const categoryCourse = await getCourseCategory()
//     const response = {
//       ...course.toJSON(),
//       categoryCourseName: categoryCourse?.find((e) => course.categoryCourseId === e.id)?.name ?? null
//     }
//     res.json(response)
//   } catch (error) {
//     console.error('Error fetching course:', error)
//     res.status(500).json({ message: 'Failed to fetch course', error: error.message })
//   }
// })
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const course = await models.Course.findByPk(id, {
      include: [
        {
          model: models.User,
          attributes: ['avatar', 'username']
        }
      ]
    })

    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }

    const categoryCourse = await getCourseCategory()
    const response = {
      ...course.toJSON(),
      categoryCourseName:
        categoryCourse?.find((e) => course.categoryCourseId === e.id)?.name ?? null,
      assignedUserAvatar: course.User?.avatar ?? null // Truy cập avatar từ User
    }

    res.json(response)
  } catch (error) {
    console.error('Error fetching course:', error)
    res.status(500).json({ message: 'Failed to fetch course', error: error.message })
  }
})

// cac ham phu tro
// đã check - không cần fix
function applyNameSearch (searchCondition, data) {
  if (searchCondition) {
    data = data.filter(
      (d) => d.name?.toLowerCase()?.indexOf(searchCondition.toLowerCase()) >= 0
    )
  }
  return data
}

// đã check - không cần fix
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

// đã check - không cần fix
async function getCourseCategory () {
  return await models.CategoryCourse.findAll({
    order: [['id', 'DESC']]
  })
}

// -----------------------------------------------trang my course ----------------------------
async function getEnrollmentByUserId (userId) {
  // Lấy danh sách các order của người dùng và kiểm tra status
  const orders = await models.Order.findAll({
    where: { userId, status: 1 }, // Fix_1001
    attributes: ['id']
  })

  // Lấy danh sách enrollment từ các order của người dùng và kiểm tra status
  return await models.Enrollment.findAll({
    where: {
      orderId: orders.map(order => order.id), // Fix_1001
      status: 1 // Fix_1001
    },
    order: [['id', 'DESC']]
  })
}

function arrayToObject (array, keyField, valueField) {
  return array.reduce((obj, item) => {
    obj[item[keyField]] = item[valueField]
    return obj
  }, {})
}

async function fetchLessonCounts () {
  // Lấy tất cả các khóa học
  const allCourses = await models.Course.findAll()

  // Duyệt qua từng khóa học để lấy số lượng bài học và bài kiểm tra
  return Promise.all(allCourses.map(async (course) => {
    // Lấy tất cả các danh mục bài học (CategoryLession) cho mỗi khóa học
    const listLessonCategories = await models.CategoryLession.findAll({
      where: { courseId: course.id },
      include: [{
        model: models.StudyItem, // Liên kết với bảng StudyItem
        include: [{
          model: models.Lession, // Liên kết với bảng Lession nếu có
          attributes: ['studyItemId'] // Chỉ lấy studyItemId từ bảng Lession
        }, {
          model: models.Exam, // Liên kết với bảng Exam nếu có
          attributes: ['studyItemId'] // Chỉ lấy studyItemId từ bảng Exam
        }]
      }]
    })

    // Tính tổng số lượng bài học và bài kiểm tra trong các danh mục bài học
    const itemCount = listLessonCategories.reduce((sum, lessonCategory) => {
      return sum + lessonCategory.StudyItems.length // Cộng tổng số mục (bài học và bài kiểm tra)
    }, 0)

    // Trả về kết quả cho mỗi khóa học
    return { courseId: course.id, count: itemCount }
  }))
}

async function fetchCourseProgressCounts (enrollments) {
  const progressCounts = await Promise.all(enrollments.map(async (enroll) => {
    const count = await models.CourseProgress.count({ where: { enrollmentId: enroll.id } })
    const lastUpdate = await models.CourseProgress.findOne({
      where: { enrollmentId: enroll.id },
      order: [['updatedAt', 'DESC']]
    })
    return { courseId: enroll.courseId, count, lastUpdate: lastUpdate?.dataValues?.updatedAt }
  }))
  return progressCounts.reduce((obj, item) => {
    obj[item.courseId] = { count: item.count, lastUpdate: item.lastUpdate }
    return obj
  }, {})
}
// chỗ này sẽ quyết định status là true hay false dựa vào việc đếm số bài học đã hoàn thành và số bài học trong khóa học chứ không dựa vào cột status trong bảng Enrollment // Fix_1000
function transformCourseData (courses, users, categories, enrollmentCounts, lessonCounts, progressCounts) {
  return courses.map((course) => {
    const lessonCount = lessonCounts[course.id] || 0
    const progressData = progressCounts[course.id] || {}
    const doneCount = progressData.count || 0
    const lastUpdate = progressData.lastUpdate || null
    return {
      id: course.id,
      name: course.name,
      summary: course.summary,
      assignedBy: users.find((user) => user.id === course.assignedBy)?.username ?? null,
      durationInMinute: course.durationInMinute,
      startDate: course.startDate,
      endDate: course.endDate,
      description: course.description,
      price: course.price,
      prepare: course.prepare,
      locationPath: course.locationPath,
      categoryCourseName: categories.find((cat) => cat.id === course.categoryCourseId)?.name ?? null,
      enrollmentCount: enrollmentCounts[course.id] || 0,
      lessonCount,
      createdAt: course.createdAt,
      doneCount,
      status: doneCount === lessonCount, // Kiểm tra xem số bài học đã hoàn thành có bằng số bài học trong khóa học không // Fix_1000
      lastUpdate
    }
  })
}
function transformCourseDataDone (courses, users, categories, enrollmentCounts, lessonCounts, progressCounts) {
  return courses.map((course) => {
    const lessonCount = lessonCounts[course.id] || 0
    const progressData = progressCounts[course.id] || {}
    const doneCount = progressData.count || 0
    const lastUpdate = progressData.lastUpdate || null
    const status = doneCount === lessonCount
    return status
      ? {
          id: course.id,
          name: course.name,
          summary: course.summary,
          assignedBy: users.find((user) => user.id === course.assignedBy)?.username ?? null,
          durationInMinute: course.durationInMinute,
          startDate: course.startDate,
          endDate: course.endDate,
          description: course.description,
          price: course.price,
          prepare: course.prepare,
          locationPath: course.locationPath,
          categoryCourseName: categories.find((cat) => cat.id === course.categoryCourseId)?.name ?? null,
          enrollmentCount: enrollmentCounts[course.id] || 0,
          lessonCount,
          createdAt: course.createdAt,
          doneCount,
          status,
          lastUpdate
        }
      : null
  }).filter(Boolean)
}
function transformCourseDataNotDone (courses, users, categories, enrollmentCounts, lessonCounts, progressCounts) {
  return courses.map((course) => {
    const lessonCount = lessonCounts[course.id] || 0
    const progressData = progressCounts[course.id] || {}
    const doneCount = progressData.count || 0
    const lastUpdate = progressData.lastUpdate || null
    const status = doneCount === lessonCount
    return !status
      ? {
          id: course.id,
          name: course.name,
          summary: course.summary,
          assignedBy: users.find((user) => user.id === course.assignedBy)?.username ?? null,
          durationInMinute: course.durationInMinute,
          startDate: course.startDate,
          endDate: course.endDate,
          description: course.description,
          price: course.price,
          prepare: course.prepare,
          locationPath: course.locationPath,
          categoryCourseName: categories.find((cat) => cat.id === course.categoryCourseId)?.name ?? null,
          enrollmentCount: enrollmentCounts[course.id] || 0,
          lessonCount,
          createdAt: course.createdAt,
          doneCount,
          status,
          lastUpdate
        }
      : null
  }).filter(Boolean) // Loại bỏ các giá trị null
}
function applyFilters (data, searchCondition, startDate, endDate, categoryCondition) {
  const dataAfterNameSearch = applyNameSearch(searchCondition, data)
  const dataAfterNameAndDateSearch = applyDateRangeSearch(startDate, endDate, dataAfterNameSearch)
  return applyCourseCategoryNameSearch(categoryCondition, dataAfterNameAndDateSearch)
}

function paginateData (data, size, page) {
  const pageSize = parseInt(size, 10)
  const pageIndex = parseInt(page, 10) - 1
  return data.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
}

// Kiem tra gia tri trươc khi yeu cau public
async function isCourseValidForStatus (courseId) {
  try {
    const course = await models.Course.findByPk(Number(courseId), {
      attributes: ['id', 'price', 'videoLocationPath', 'locationPath', 'prepare', 'description'],
      include: [
        {
          model: models.CategoryLession,
          attributes: ['id']
        }
      ]
    })

    if (!course) {
      return false
    }

    if (!course.price || !course.videoLocationPath || !course.locationPath) {
      return false
    }
    console.log('Step 1')

    if (
      !course.prepare ||
      typeof course.prepare !== 'string' || course.prepare.trim() === '' ||
      !course.description || typeof course.description !== 'string' || course.description.trim() === ''
    ) {
      return false
    }
    console.log('Step 2')

    const categoryLessions = course.CategoryLessions || []
    if (categoryLessions.length === 0) {
      return false
    }
    console.log('Step 3')

    for (const category of categoryLessions) {
      const studyItems = await models.StudyItem.findAll({
        where: { lessionCategoryId: category.id },
        include: [
          {
            model: models.Exam,
            where: { studyItemId: sequelize.col('StudyItem.id') },
            required: false
          },
          {
            model: models.Lession,
            where: { studyItemId: sequelize.col('StudyItem.id') },
            required: false
          }
        ]
      })

      if (studyItems.length === 0) {
        return false
      }
      console.log('Step 4')

      for (const studyItem of studyItems) {
        if (studyItem.Lession && !studyItem.Lession.locationPath) {
          return false
        }
        console.log('Step 5')

        if (studyItem.Exam) {
          const questionCount = await models.Question.count({
            where: { examId: studyItem.id }
          })

          if (questionCount === 0) {
            return false
          }
          console.log('Step 6')
        }
      }
    }

    return true
  } catch (error) {
    console.error('Validation error:', error)
    return false
  }
}

module.exports = router

router.get('/get/:courseId', isAuthenticated, async (req, res) => {
  try {
    const { courseId } = req.params
    const categories = await models.StudyItem.findAll({
      where: { courseId },
      order: [['order', 'ASC']]
    })

    res.status(200).json(categories)
  } catch (error) {
    res.status(500).json({ error: jsonError })
  }
})

// router.get('/:id/validate', async (req, res) => {
//   const { id } = req.params
//   const userId = req.query.userId || null // Lấy userId từ query hoặc null nếu không có

//   try {
//     const course = await models.Course.findByPk(id, {
//       attributes: ['id', 'name', 'status', 'startDate', 'endDate']
//     })

//     if (!course) {
//       return res.status(404).json({ valid: false, message: 'Khóa học không tồn tại.' })
//     }

//     // Nếu có userId, kiểm tra xem người dùng đã đăng ký chưa
//     if (userId) {
//       const enrollment = await models.Enrollment.findOne({
//         include: [
//           {
//             model: models.Order,
//             where: { userId } // Kiểm tra người dùng thông qua bảng orders
//           }
//         ],
//         where: { courseId: id }
//       })

//       if (enrollment) {
//         return res.status(200).json({ valid: true, message: 'Người dùng đã đăng ký khóa học.' })
//       }
//     }

//     const now = new Date()

//     // Kiểm tra tính hợp lệ của khóa học
//     if (
//       course.status === 0 || // Trạng thái chưa xuất bản
//       course.status === 1 || // Trạng thái chờ duyệt
//       course.status === 4 || // Trạng thái riêng tư
//       course.status === 5 || // Trạng thái đã ẩn
//       (course.status === 3 && (now < new Date(course.startDate) || now > new Date(course.endDate))) // Ngoài thời hạn đăng ký
//     ) {
//       return res.status(200).json({ valid: false, message: 'Khóa học không khả dụng.' })
//     }

//     // Khóa học hợp lệ
//     return res.status(200).json({ valid: true, message: 'Khóa học hợp lệ.' })
//   } catch (error) {
//     console.error('Error validating course:', error)
//     res.status(500).json({ valid: false, message: 'Lỗi kiểm tra khóa học.' })
//   }
// })
router.get('/:id/validate', async (req, res) => {
  const { id } = req.params
  const userId = req.query.userId || null // Lấy userId từ query hoặc null nếu không có

  try {
    const course = await models.Course.findByPk(id, {
      attributes: ['id', 'name', 'status', 'startDate', 'endDate']
    })

    if (!course) {
      return res.status(404).json({ valid: false, message: 'Khóa học không tồn tại.' })
    }

    // Nếu có userId, kiểm tra xem người dùng đã đăng ký chưa
    if (userId) {
      const enrollment = await models.Enrollment.findOne({
        include: [
          {
            model: models.Order,
            where: { userId } // Kiểm tra người dùng thông qua bảng orders
          }
        ],
        where: {
          courseId: id,
          status: 1 // Chỉ kiểm tra những bản ghi có status = 1
        }
      })

      if (enrollment) {
        return res.status(200).json({
          valid: true,
          message: 'Người dùng đã đăng ký khóa học.'
        })
      }
    }

    const now = new Date()
    const startDate = course.startDate ? new Date(course.startDate) : null
    const endDate = course.endDate ? new Date(course.endDate) : null

    // Kiểm tra tính hợp lệ của khóa học
    if (
      course.status === 0 || // Chưa xuất bản
      course.status === 1 || // Chờ duyệt
      course.status === 4 || // Riêng tư (không hợp lệ mặc định)
      course.status === 5 || // Đã ẩn
      (course.status === 3 && // Trạng thái riêng tư với giới hạn thời gian
        ((startDate && now < startDate) || (endDate && now > endDate))) // Ngoài thời gian đăng ký
    ) {
      return res.status(200).json({
        valid: false,
        message: 'Khóa học không khả dụng do trạng thái hoặc thời hạn đăng ký.'
      })
    }

    // Khóa học hợp lệ
    return res.status(200).json({
      valid: true,
      message: 'Khóa học hợp lệ và có thể đăng ký.'
    })
  } catch (error) {
    console.error('Error validating course:', error)
    return res.status(500).json({
      valid: false,
      message: 'Lỗi kiểm tra khóa học.'
    })
  }
})
