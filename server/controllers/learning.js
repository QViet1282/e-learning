const express = require('express')
const { models } = require('../models')
const { isAuthenticated } = require('../middlewares/authentication')
const jsonError = 'Internal server error'
const router = express.Router()
const { infoLogger, errorLogger } = require('../logs/logger')

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

// trang home page
// đã check - không cần fix - v2 fix
router.get('/getEnrollmentByCourseId/:courseId', isAuthenticated, async (req, res) => {
  const loginedUserId = req.user.id
  const courseIdData = req.params.courseId
  try {
    console.log('courseId', courseIdData)

    // Tìm Order bằng userId và kiểm tra status
    const order = await models.Order.findOne({ where: { userId: loginedUserId, status: 1 } }) // Fix_1001
    if (!order) {
      return res.json(null)
    }

    // Tìm Enrollment bằng orderId và courseId và kiểm tra status // Fix_1001
    const enrollment = await models.Enrollment.findOne({ where: { orderId: order.id, courseId: courseIdData, status: 1 } })
    if (enrollment) {
      logInfo(req, enrollment)
      return res.json(enrollment)
    } else {
      return res.json(null)
    }
  } catch (err) {
    logError(req, err)
    res.status(500).json({ message: jsonError })
  }
})
// trang course detail
// đã check - không cần fix
router.get('/getCategoryLessionsByCourse/:courseId', isAuthenticated, async (req, res) => {
  const { courseId } = req.params

  try {
    const categoryLessions = await models.CategoryLession.findAll({
      where: {
        courseId
      }
    })
    logInfo(req, categoryLessions)
    res.json(categoryLessions)
  } catch (err) {
    logError(req, err)
    res.status(500).json({ message: jsonError })
  }
})

// hàm này dùng để lấy ra tất cả các lession và exam của 1 category -- ở bên trang course detail
// đã fix
router.get('/getLessionByCategory/:lessionCategoryId', isAuthenticated, async (req, res) => {
  const { lessionCategoryId } = req.params
  console.log('Route hit:', req.params)

  try {
    const items = await models.StudyItem.findAll({
      where: {
        lessionCategoryId,
        itemType: ['lession', 'exam'] // Retrieve both lessons and exams
      },
      include: [
        {
          model: models.Lession, // Include lessons
          attributes: ['type', 'locationPath', 'uploadedBy'] // Specify fields to return from Lession
        },
        {
          model: models.Exam, // Include exams
          attributes: ['durationInMinute', 'pointToPass', 'createrId', 'numberOfAttempt'] // Specify fields to return from Exam
        }
      ]
    })

    // Format the response to include the relevant data
    // eslint-disable-next-line array-callback-return
    const formattedItems = items.map(item => {
      if (item.itemType === 'lession' && item.Lession) {
        return {
          id: item.id,
          lessionCategoryId: item.lessionCategoryId,
          name: item.name,
          description: item.description,
          itemType: item.itemType,
          type: item.Lession.type, // Access type from Lession
          content: item.content,
          order: item.order,
          locationPath: item.Lession.locationPath, // Access locationPath from Lession
          uploadedBy: item.Lession.uploadedBy, // Access uploadedBy from Lession
          status: item.status,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        }
      } else if (item.itemType === 'exam' && item.Exam) {
        return {
          id: item.id,
          lessionCategoryId: item.lessionCategoryId,
          name: item.name,
          description: item.description,
          itemType: item.itemType,
          type: 'exam', // Access type from Lession
          content: item.content,
          order: item.order,
          durationInMinute: item.Exam.durationInMinute, // Access durationInMinute from Exam
          pointToPass: item.Exam.pointToPass, // Access pointToPass from Exam
          createrId: item.Exam.createrId, // Access createrId from Exam
          numberOfAttempt: item.Exam.numberOfAttempt, // Access numberOfAttempt from Exam
          status: item.status,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        }
      }
    })

    logInfo(req, formattedItems)
    res.json(formattedItems)
  } catch (err) {
    logError(req, err)
    res.status(500).json({ message: 'Error occurred while fetching items' })
  }
})

// đã check - không cần fix - v2 fix
router.post('/addEnrollment', isAuthenticated, async (req, res) => {
  const loginedUserId = req.user.id
  const courseId = req.body.data

  try {
    // Tạo một Order mới trước
    const newOrder = await models.Order.create({
      userId: loginedUserId,
      orderDate: new Date(),
      totalAmount: 0,
      status: 0, // Fix_1001
      paymentMethod: 'PayOS' // Fix_1001
    })

    // Sử dụng orderId từ Order mới để tạo Enrollment
    const newEnrollment = await models.Enrollment.create({
      orderId: newOrder.id,
      courseId,
      enrollmentDate: new Date(), // Fix_1001
      status: 0 // Khóa học chưa kích hoạt
    })

    logInfo(req, newEnrollment)
    res.json(newEnrollment)
  } catch (err) {
    logError(req, err)
    res.status(500).json({ message: jsonError })
  }
})
// đã check - không cần fix - v2 fix
router.get('/getEnrollmentByUserId', isAuthenticated, async (req, res) => {
  try {
    const loginedUserId = req.user.id

    // Tìm tất cả các Order dựa trên userId và kiểm tra status // Fix_1001
    const orders = await models.Order.findAll({ where: { userId: loginedUserId, status: 1 } })

    // Lấy tất cả orderId từ các Order tìm được
    const orderIds = orders.map(order => order.id)

    // Tìm tất cả các Enrollment dựa trên orderId và kiểm tra status // Fix_1001
    const enrollments = await models.Enrollment.findAll({ where: { orderId: orderIds, status: 1 } })

    logInfo(req, enrollments)
    res.json(enrollments)
  } catch (err) {
    logError(req, err)
    res.status(500).json({ message: jsonError })
  }
})

// đã check - đã fix cũ nằm ở bên lession.js
// getLessionById
// router.get('/:lessionId', isAuthenticated, async (req, res) => {
//   const { lessionId } = req.params

//   try {
//     const lessionCate = await models.CategoryLession.findAll()

//     // Fetch either lession or exam from StudyItem by primary key
//     const lessionOrExam = await models.StudyItem.findByPk(lessionId)

//     if (!lessionOrExam) {
//       return res.status(404).json({ message: 'Item not found' })
//     }

//     const response = {
//       ...lessionOrExam.toJSON(), // Convert the item (lession or exam) to JSON
//       categoryLessionName: lessionCate?.find((e) => lessionOrExam.lessionCategoryId === e.id)?.name ?? null
//     }

//     res.json(response)
//   } catch (err) {
//     console.error(err)
//     res.status(500).json({ message: 'Error occurred while fetching the item' })
//   }
// })
router.get('/:lessionId', isAuthenticated, async (req, res) => {
  const { lessionId } = req.params

  try {
    // Fetch all category lessons for the lookup
    const lessionCate = await models.CategoryLession.findAll()

    // Fetch the lession or exam based on the primary key from StudyItem
    const item = await models.StudyItem.findByPk(lessionId, {
      include: [
        {
          model: models.Lession,
          attributes: ['type', 'locationPath', 'uploadedBy'] // Specify fields to return from Lession
        }, // Include lesson details
        {
          model: models.Exam,
          attributes: ['durationInMinute', 'pointToPass', 'createrId', 'numberOfAttempt'] // Specify fields to return from Exam
        } // Include exam details
      ]
    })

    if (!item) {
      return res.status(404).json({ message: 'Item not found' })
    }

    // Format the response based on whether the item is a lession or an exam
    let response
    if (item.itemType === 'lession' && item.Lession) {
      response = {
        id: item.id,
        lessionCategoryId: item.lessionCategoryId,
        name: item.name,
        description: item.description,
        itemType: item.itemType,
        type: item.Lession.type, // Access type from Lession
        content: item.content,
        order: item.order,
        locationPath: item.Lession.locationPath, // Access locationPath from Lession
        uploadedBy: item.Lession.uploadedBy, // Access uploadedBy from Lession
        status: item.status,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        categoryLessionName: lessionCate?.find((e) => item.lessionCategoryId === e.id)?.name || null
      }
    } else if (item.itemType === 'exam' && item.Exam) {
      response = {
        id: item.id,
        lessionCategoryId: item.lessionCategoryId,
        name: item.name,
        description: item.description,
        itemType: item.itemType,
        type: 'exam',
        content: item.content,
        order: item.order,
        durationInMinute: item.Exam.durationInMinute, // Access durationInMinute from Exam
        pointToPass: item.Exam.pointToPass, // Access pointToPass from Exam
        createrId: item.Exam.createrId, // Access createrId from Exam
        numberOfAttempt: item.Exam.numberOfAttempt, // Access numberOfAttempt from Exam
        status: item.status,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        categoryLessionName: lessionCate?.find((e) => item.lessionCategoryId === e.id)?.name || null
      }
    }

    res.json(response)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error occurred while fetching the item' })
  }
})

// trang elearning - cũ bên learning.js
// đã check - không cần fix
// router.get('/getProgressByEnrollmentId/:enrollmentId', isAuthenticated, async (req, res) => {
//   try {
//     const enrollmentId = req.params.enrollmentId

//     const courseProgress = await models.CourseProgress.findAll({ where: { enrollmentId } })
//     logInfo(req, courseProgress)
//     res.status(200).json({ data: courseProgress })
//   } catch (error) {
//     logError(req, error)
//     res.status(500).json({ message: jsonError })
//   }
// })
router.get('/getProgressByEnrollmentId/:enrollmentId', isAuthenticated, async (req, res) => {
  try {
    const { enrollmentId } = req.params

    // Find course progress and join with StudyItem to get lessionId
    const courseProgress = await models.CourseProgress.findAll({
      where: { enrollmentId },
      include: [
        {
          model: models.StudyItem, // Join StudyItem to get lessionId
          attributes: ['id'] // Only fetch the id (which will be used as lessionId)
        }
      ]
    })

    // Format the response to include lessionId instead of studyItemId
    const formattedProgress = courseProgress.map(progress => ({
      enrollmentId: progress.enrollmentId,
      lessionId: progress.StudyItem.id, // Use the id from StudyItem as lessionId
      completionAt: progress.completionAt,
      createdAt: progress.createdAt,
      updatedAt: progress.updatedAt
    }))

    logInfo(req, formattedProgress)
    res.status(200).json({ data: formattedProgress })
  } catch (error) {
    logError(req, error)
    res.status(500).json({ message: 'Error occurred while fetching progress' })
  }
})

// trang elearning - cũ bên enrollment.js
// đã check - không cần fix - v2 fix
router.post('/markAsComplete', isAuthenticated, async (req, res) => {
  try {
    const { courseId } = req.body.data
    const userId = req.user.id

    // Tìm Order dựa trên userId và courseId và kiểm tra status // Fix_1001
    const order = await models.Order.findOne({ where: { userId, status: 1 } })
    if (!order) {
      return res.json(null)
    }

    // Tìm Enrollment dựa trên orderId và kiểm tra status // Fix_1001
    const enrollment = await models.Enrollment.findOne({ where: { orderId: order.id, courseId, status: 1 } })
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' })
    }

    // Cập nhật Enrollment
    enrollment.completedDate = new Date()
    // enrollment.status = true // có thể bỏ đi // Fix_1000
    await enrollment.save()

    logInfo(req, { message: 'Course marked as complete' })
    return res.status(200).json({ message: 'Course marked as complete' })
  } catch (error) {
    logError(req, error)
    return res.status(500).json({ error: jsonError })
  }
})

// trang elearning - cũ bên learning.js
// router.post('/addProgress', isAuthenticated, async (req, res) => {
//   try {
//     const { enrollmentId, lessionId } = req.body.data
//     console.log('enrollmentId', enrollmentId)
//     console.log('lessionId', lessionId)
//     // Kiểm tra xem tiến độ đã tồn tại chưa
//     console.log('check 1')
//     const existingProgress = await models.CourseProgress.findOne({
//       where: {
//         enrollmentId,
//         studyItemId: lessionId // Map đúng với studyItemId
//       }
//     })
//     console.log('check 2')
//     if (existingProgress) {
//       console.log('Học lại')
//       return res.status(400).json({ data: existingProgress })
//     }

//     // Thêm tiến độ mới
//     console.log('check 3')
//     const newProgress = await models.CourseProgress.create({
//       enrollmentId,
//       studyItemId: lessionId, // Map lessionId với studyItemId
//       completionAt: null
//     })

//     console.log('check 4')
//     if (!newProgress) {
//       return res.status(400).json({ message: 'Thêm tiến độ thất bại' })
//     }

//     logInfo(req, newProgress)

//     // Lấy courseId từ Enrollment
//     console.log('check 5')
//     const enrollment = await models.Enrollment.findOne({
//       where: { id: enrollmentId },
//       attributes: ['courseId']
//     })

//     // Lấy tất cả danh mục bài học cho khóa học
//     console.log('check 6')
//     const categoryLessions = await models.CategoryLession.findAll({
//       where: { courseId: enrollment.courseId },
//       attributes: ['id'] // Chỉ cần id của danh mục
//     })

//     let totalItems = 0 // Đếm cả bài học và bài kiểm tra

//     // Duyệt qua từng danh mục bài học và đếm số lượng bài học và bài kiểm tra trong mỗi danh mục
//     console.log('categoryLessions', categoryLessions)
//     console.log('check 7')
//     for (const categoryLession of categoryLessions) {
//       const itemCount = await models.StudyItem.count({
//         where: {
//           lessionCategoryId: categoryLession.id // Đếm tất cả bài học và bài kiểm tra
//         }
//       })

//       totalItems += itemCount // Cộng dồn số lượng bài học và bài kiểm tra
//     }

//     console.log('Tổng số bài học và bài kiểm tra:', totalItems)

//     // Cập nhật tiến độ học viên
//     console.log('check 8')
//     await models.Enrollment.increment('progress', {
//       by: 1 / totalItems, // Cập nhật tiến độ dựa trên tổng số bài học và bài kiểm tra
//       where: { id: enrollmentId }
//     })
//     console.log('check 9')
//     res.status(200).json({ data: newProgress })
//   } catch (error) {
//     logError(req, error)
//     res.status(500).json({ message: 'Có lỗi xảy ra khi thêm tiến độ' })
//   }
// })

// v2
// trang elearning - cũ bên learning.js
router.post('/addProgress', isAuthenticated, async (req, res) => {
  try {
    const { enrollmentId, lessionId } = req.body.data
    // Kiểm tra xem tiến độ đã tồn tại chưa
    const existingProgress = await models.CourseProgress.findOne({
      where: {
        enrollmentId,
        studyItemId: lessionId // Map đúng với studyItemId
      }
    })
    if (existingProgress) {
      console.log('Học lại')
      return res.status(400).json({ data: existingProgress })
    }

    // Thêm tiến độ mới
    const newProgress = await models.CourseProgress.create({
      enrollmentId,
      studyItemId: lessionId, // Map lessionId với studyItemId
      completionAt: null
    })

    if (!newProgress) {
      return res.status(400).json({ message: 'Thêm tiến độ thất bại' })
    }

    logInfo(req, newProgress)
    console.log('check 9')
    res.status(200).json({ data: newProgress })
  } catch (error) {
    logError(req, error)
    res.status(500).json({ message: 'Có lỗi xảy ra khi thêm tiến độ' })
  }
})

module.exports = router
