/* eslint-disable no-unused-vars */
const express = require('express')
const { models } = require('../models')
const { sequelize } = require('../models')
const { isAuthenticated } = require('../middlewares/authentication')
const jsonError = 'Internal server error'
const router = express.Router()
const { infoLogger, errorLogger } = require('../logs/logger')
// const { INTEGER } = require('sequelize')
const { Op } = require('sequelize')
const CategoryCourse = require('../models/category_course')
const StudyItem = require('../models/study_item')

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

/*****************************
 * ROUTES FOR COURSE
 *****************************/

router.get('/getAllCourseInfo', isAuthenticated, async (req, res) => {
  try {
    const courses = await models.Course.findAll()
    logInfo(req, courses)
    res.status(200).json(courses)
  } catch (err) {
    logError(req, err)
    console.error(err)
    res.status(500).json({ message: jsonError })
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

    logInfo(req, course)
    res.status(200).json(course)
  } catch (err) {
    logError(req, err)
    console.error(err)
    res.status(500).json({ message: 'Lỗi hệ thống, vui lòng thử lại sau.' })
  }
})

router.post('/createNewCourse', isAuthenticated, async (req, res) => {
  try {
    const {
      categoryCourseId,
      name,
      assignedBy
    } = req.body

    console.log('Request Body:', req.body)
    if (!name || !assignedBy) {
      return res.status(400).json({ error: 'Required fields are missing' })
    }

    const newCourse = await models.Course.create({
      categoryCourseId,
      name,
      assignedBy
    })
    logInfo(req, newCourse)
    res.status(201).json(newCourse)
  } catch (error) {
    logError(req, error)
    res.status(500).json({ error: jsonError })
  }
})

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
    prepare,
    price,
    status
  } = req.body

  console.log('Request Body:', req.body)

  try {
    // Tìm khóa học theo ID
    const course = await models.Course.findByPk(courseId)

    // Kiểm tra xem khóa học có tồn tại không
    if (!course) {
      return res.status(404).json({ error: 'Course not found' })
    }

    // Cập nhật thông tin khóa học
    await course.update({
      categoryCourseId,
      name,
      summary,
      startDate,
      endDate,
      description,
      locationPath,
      prepare,
      price,
      status
    })

    logInfo(req, course)
    res.status(200).json(course)
  } catch (error) {
    logError(req, error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/*****************************
 * ROUTES FOR CATEGORY LESSONS
 *****************************/
router.get('/getCategoryLessionByCourse/:courseId', isAuthenticated, async (req, res) => {
  try {
    const { courseId } = req.params
    const categories = await models.CategoryLession.findAll({
      where: { courseId },
      order: [['order', 'ASC']]
    })

    logInfo(req, categories)
    res.status(200).json(categories)
  } catch (error) {
    logError(req, error)
    res.status(500).json({ error: jsonError })
  }
})

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

    logInfo(req, newCategoryLession)

    return res.status(201).json(newCategoryLession)
  } catch (error) {
    logError(req, error)
    return res.status(500).json({ error: jsonError })
  }
})

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

    logInfo(req, categoryLession)
    res.status(200).json(categoryLession)
  } catch (error) {
    logError(req, error)
    res.status(500).json({ error: jsonError })
  }
})

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
    logError(req, error)
    res.status(500).json({ error: 'An error occurred while updating study item order' })
  }
})

/*****************************
 * ROUTES FOR StudyItem
 *****************************/

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

    logInfo(req, studyItemDetails)
    res.status(200).json(studyItemDetails)
  } catch (error) {
    logError(req, error)
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
    logError(req, error)
    res.status(500).json({ error: 'An error occurred while updating study item order' })
  }
})
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
      models.Order.findAll({ where: { userId: loginedUserId }, attributes: ['id'] }),
      getCourseCategory(),
      models.Enrollment.count({ group: ['courseId'] }),
      fetchLessonCounts()
    ])

    // Lấy danh sách orderId từ orders
    const orderIds = orders.map(order => order.id)

    // Truy vấn tất cả các Enrollment bằng orderIds
    const enrollments = await models.Enrollment.findAll({
      where: { orderId: orderIds },
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
        courseId: filteredCourses.map(course => course.id)
      }
    })

    const courseProgressCountsObject = await fetchCourseProgressCounts(userEnrollments)

    const dataFromDatabase = transformCourseDataDone(filteredCourses, allUsers, categoryCourse, enrollmentCountsObject, lessonCountsObject, courseProgressCountsObject)

    const dataAfterSearch = applyFilters(dataFromDatabase, searchCondition, startDate, endDate, categoryCondition)
    const dataOfCurrentWindow = paginateData(dataAfterSearch, size, page)

    logInfo(req, dataOfCurrentWindow)
    res.json({
      page: Number(page),
      size: Number(size),
      totalRecords: dataAfterSearch.length,
      data: dataOfCurrentWindow
    })
  } catch (error) {
    logError(req, error)
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
      models.Order.findAll({ where: { userId: loginedUserId }, attributes: ['id'] }),
      getCourseCategory(),
      models.Enrollment.count({ group: ['courseId'] }),
      fetchLessonCounts()
    ])

    // Lấy danh sách orderId từ orders
    const orderIds = orders.map(order => order.id)

    // Truy vấn tất cả các Enrollment bằng orderIds
    const enrollments = await models.Enrollment.findAll({
      where: { orderId: orderIds },
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
        courseId: filteredCourses.map(course => course.id)
      }
    })

    const courseProgressCountsObject = await fetchCourseProgressCounts(userEnrollments)

    const dataFromDatabase = transformCourseDataNotDone(filteredCourses, allUsers, categoryCourse, enrollmentCountsObject, lessonCountsObject, courseProgressCountsObject)

    const dataAfterSearch = applyFilters(dataFromDatabase, searchCondition, startDate, endDate, categoryCondition)
    const dataOfCurrentWindow = paginateData(dataAfterSearch, size, page)

    logInfo(req, dataOfCurrentWindow)
    res.json({
      page: Number(page),
      size: Number(size),
      totalRecords: dataAfterSearch.length,
      data: dataOfCurrentWindow
    })
  } catch (error) {
    logError(req, error)
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
      models.Order.findAll({ where: { userId: loginedUserId }, attributes: ['id'] }),
      getCourseCategory(),
      models.Enrollment.count({ group: ['courseId'] }),
      fetchLessonCounts()
    ])

    // Lấy danh sách orderId từ orders
    const orderIds = orders.map(order => order.id)

    // Truy vấn tất cả các Enrollment bằng orderIds
    const enrollments = await models.Enrollment.findAll({
      where: { orderId: orderIds },
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
        courseId: filteredCourses.map(course => course.id)
      }
    })

    const courseProgressCountsObject = await fetchCourseProgressCounts(userEnrollments)

    const dataFromDatabase = transformCourseData(filteredCourses, allUsers, categoryCourse, enrollmentCountsObject, lessonCountsObject, courseProgressCountsObject)

    const dataAfterSearch = applyFilters(dataFromDatabase, searchCondition, startDate, endDate, categoryCondition)
    const dataOfCurrentWindow = paginateData(dataAfterSearch, size, page)

    logInfo(req, dataOfCurrentWindow)
    res.json({
      page: Number(page),
      size: Number(size),
      totalRecords: dataAfterSearch.length,
      data: dataOfCurrentWindow
    })
  } catch (error) {
    logError(req, error)
    console.log(error)
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách khóa học.' })
  }
})
// ---------------------------------------------------------------------------------------------------------

// trang home page
// đã fix
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

// đã fix - v2 fix
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

    // Lấy rating trung bình của mỗi khóa học từ bảng Enrollment
    const ratings = await models.Enrollment.findAll({
      attributes: [
        'courseId',
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating']
      ],
      where: {
        rating: {
          [Op.ne]: null // Chỉ lấy các bản ghi có rating khác null
        }
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

// đã check - không cần fix
function applyDateRangeSearch (startDate, endDate, inputData) {
  const filteredData = inputData.filter((d) => {
    return new Date(d.startDate) >= new Date(startDate) && new Date(d.endDate) <= new Date(endDate)
  })
  return filteredData
}

// đã check - không cần fix
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

// trang course detail
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
  // Lấy danh sách các order của người dùng
  const orders = await models.Order.findAll({
    where: { userId },
    attributes: ['id']
  })

  // Lấy danh sách enrollment từ các order của người dùng
  return await models.Enrollment.findAll({
    where: {
      orderId: orders.map(order => order.id)
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
      status: doneCount === lessonCount,
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

module.exports = router

router.get('/get/:courseId', isAuthenticated, async (req, res) => {
  try {
    const { courseId } = req.params
    const categories = await models.StudyItem.findAll({
      where: { courseId },
      order: [['order', 'ASC']]
    })

    logInfo(req, categories)
    res.status(200).json(categories)
  } catch (error) {
    logError(req, error)
    res.status(500).json({ error: jsonError })
  }
})
