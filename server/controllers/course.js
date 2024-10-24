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

module.exports = router
