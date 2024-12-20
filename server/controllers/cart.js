const express = require('express')
const { models } = require('../models')
const router = express.Router()
const { Op } = require('sequelize')

// router.post('/cart/validate', async (req, res) => {
//   const { userId } = req.body

//   try {
//     const order = await models.Order.findOne({
//       where: { userId, status: 0 },
//       include: [
//         {
//           model: models.Enrollment,
//           include: [
//             {
//               model: models.Course,
//               attributes: ['id', 'name', 'status', 'startDate', 'endDate']
//             }
//           ]
//         }
//       ]
//     })

//     if (!order) {
//       return res.status(400).json({ message: 'Giỏ hàng trống' })
//     }

//     const invalidCourses = []
//     const validCourses = []
//     const now = new Date()

//     order.Enrollments.forEach(enrollment => {
//       const course = enrollment.Course

//       // Kiểm tra tính hợp lệ
//       if (course.status === 0 || course.status === 1 || course.status === 5 || course.status === 4 || (course.status === 3 && (now < new Date(course.startDate) || now > new Date(course.endDate)))) {
//         invalidCourses.push({
//           id: course.id,
//           name: course.name,
//           reason: course.status === 3
//             ? 'Khóa học đã chuyển sang trạng thái riêng tư.'
//             : 'Khóa học đã hết thời hạn đăng ký.'
//         })
//       } else {
//         validCourses.push(course)
//       }
//     })

//     return res.status(200).json({ valid: invalidCourses.length === 0, validCourses, invalidCourses })
//   } catch (error) {
//     console.error('Error validating cart:', error)
//     res.status(500).json({ message: 'Lỗi kiểm tra giỏ hàng', error: error.message })
//   }
// })

router.post('/cart/validate', async (req, res) => {
  const { userId } = req.body

  try {
    const order = await models.Order.findOne({
      where: { userId, status: 0 },
      include: [
        {
          model: models.Enrollment,
          include: [
            {
              model: models.Course,
              attributes: ['id', 'name', 'status', 'startDate', 'endDate']
            }
          ]
        }
      ]
    })

    if (!order) {
      return res.status(400).json({ message: 'Giỏ hàng trống' })
    }

    const invalidCourses = []
    const validCourses = []
    const now = new Date()

    order.Enrollments.forEach(enrollment => {
      const course = enrollment.Course

      const startDate = course.startDate ? new Date(course.startDate) : null
      const endDate = course.endDate ? new Date(course.endDate) : null

      // Kiểm tra tính hợp lệ
      if (
        course.status === 0 || // Không hoạt động
        course.status === 1 || // Chưa mở bán
        course.status === 5 || // Đã ngừng hoạt động
        course.status === 4 || // Đã bị khóa
        (course.status === 3 && // Trạng thái riêng tư
          ((startDate && now < startDate) || (endDate && now > endDate))) // Ngoài thời gian đăng ký
      ) {
        // Khóa học không hợp lệ
        invalidCourses.push({
          id: course.id,
          name: course.name,
          reason:
            course.status === 3
              ? 'Khóa học đã chuyển sang trạng thái riêng tư hoặc hết thời hạn đăng ký.'
              : 'Khóa học không khả dụng.'
        })
      } else {
        // Khóa học hợp lệ
        validCourses.push(course)
      }
    })

    return res.status(200).json({ valid: invalidCourses.length === 0, validCourses, invalidCourses })
  } catch (error) {
    console.error('Error validating cart:', error)
    res.status(500).json({ message: 'Lỗi kiểm tra giỏ hàng', error: error.message })
  }
})

// // Thêm khóa học vào giỏ hàng
// router.post('/cart/add', async (req, res) => {
//   const { userId, courseId } = req.body

//   try {
//     // Kiểm tra khóa học tồn tại
//     const course = await models.Course.findOne({ where: { id: courseId } })
//     if (!course) {
//       return res.status(404).json({ message: 'Khóa học không tồn tại' })
//     }

//     // Tìm đơn hàng chưa hoàn tất (pending) của người dùng
//     let order = await models.Order.findOne({ where: { userId, status: 'pending' } })

//     // Nếu không có đơn hàng, tạo mới đơn hàng (giỏ hàng)
//     if (!order) {
//       order = await models.Order.create({
//         userId,
//         orderDate: new Date(),
//         status: 'pending', // Đơn hàng chưa thanh toán
//         totalAmount: 0,
//         paymentMethod: null
//       })
//     }

//     // Kiểm tra xem khóa học đã có trong giỏ hàng chưa
//     const existingEnrollment = await models.Enrollment.findOne({
//       where: { courseId, orderId: order.id }
//     })

//     if (existingEnrollment) {
//       return res.status(400).json({ message: 'Khóa học đã có trong giỏ hàng' })
//     }

//     // Thêm khóa học vào đơn hàng (enrollment)
//     await models.Enrollment.create({
//       courseId,
//       orderId: order.id,
//       enrollmentDate: new Date(),
//       status: 0, // Khóa học trong giỏ chưa kích hoạt
//       progress: 0
//     })

//     // Cập nhật tổng tiền của đơn hàng
//     order.totalAmount += course.price
//     await order.save()

//     res.status(200).json({ message: 'Khóa học đã được thêm vào giỏ hàng', order })
//   } catch (error) {
//     console.error('Error adding course to cart:', error)
//     res.status(500).json({ message: 'Error adding course to cart', error: error.message })
//   }
// })

// Add a course to the cart
router.post('/cart/add', async (req, res) => {
  const { userId, courseId } = req.body.data
  console.log('userId------------------------------------', userId)
  console.log('courseId---------------------------------', courseId)
  try {
    // Kiểm tra xem khóa học có tồn tại không
    const course = await models.Course.findOne({ where: { id: courseId } })
    if (!course) {
      return res.status(404).json({ message: 'Khóa học không tồn tại' })
    }

    // Tìm đơn hàng của người dùng có trạng thái 0 (chờ thanh toán) hoặc 2 (đang thanh toán)
    let order = await models.Order.findOne({
      where: { userId, status: { [Op.in]: [0, 2] } } // Kiểm tra trạng thái 0 và 2
    })

    // Nếu tìm thấy đơn hàng với trạng thái "đang thanh toán" (status = 2), tìm đơn hàng có trạng thái "chờ thanh toán" (status = 0)
    if (order && order.status === 2) {
      order = await models.Order.findOne({
        where: { userId, status: 0 } // Tìm đơn hàng có trạng thái "chờ thanh toán" (status = 0)
      })
    }

    // Nếu không có đơn hàng nào có trạng thái "chờ thanh toán" (status = 0), tạo đơn hàng mới
    if (!order) {
      order = await models.Order.create({
        userId,
        orderDate: new Date(),
        status: 0, // Trạng thái chờ thanh toán
        totalAmount: 0
      })
    }

    // Kiểm tra xem khóa học đã có trong giỏ hàng chưa (dựa trên orderId và status = 0)
    const existingEnrollment = await models.Enrollment.findOne({
      where: { courseId, orderId: order.id, status: 0 } // Chỉ kiểm tra các enrollment có status = 0 (chưa thanh toán)
    })

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Khóa học đã có trong giỏ hàng' })
    }

    // Thêm khóa học vào giỏ hàng
    await models.Enrollment.create({
      courseId,
      orderId: order.id,
      enrollmentDate: new Date(),
      status: 0, // Đánh dấu là chưa kích hoạt
      progress: 0 // Tiến độ chưa bắt đầu
    })

    // Cập nhật lại tổng số tiền của đơn hàng
    const totalAmount = parseFloat(order.totalAmount) + parseFloat(course.price)
    order.totalAmount = totalAmount.toFixed(2) // Cập nhật tổng số tiền của đơn hàng
    await order.save()

    // Trả về thông báo và đơn hàng mới được cập nhật
    res.status(200).json({ message: 'Khóa học đã được thêm vào giỏ hàng', order })
  } catch (error) {
    console.error('Error adding course to cart:', error)
    res.status(500).json({ message: 'Error adding course to cart', error: error.message })
  }
})

// Xem giỏ hàng của người dùng
router.get('/cart/:userId', async (req, res) => {
  const { userId } = req.params

  try {
    // Lấy tất cả các đơn hàng đã thanh toán của người dùng
    const completedOrders = await models.Order.findAll({
      where: { userId, status: 1 },
      include: [
        {
          model: models.Enrollment,
          attributes: ['courseId']
        }
      ]
    })

    // Tập hợp các courseId đã mua
    const purchasedCourseIds = new Set()
    completedOrders.forEach(order => {
      order.Enrollments.forEach(enrollment => {
        purchasedCourseIds.add(enrollment.courseId)
      })
    })

    // Tìm đơn hàng chưa thanh toán (giỏ hàng hiện tại)
    const order = await models.Order.findOne({
      where: { userId, status: 0 },
      include: [
        {
          model: models.Enrollment,
          include: [
            {
              model: models.Course,
              include: [
                {
                  model: models.User, // Include the User model
                  attributes: ['username'] // Only fetch the username attribute
                }
              ]
            }
          ]
        }
      ]
    })

    if (!order) {
      return res.status(200).json({ message: 'Giỏ hàng trống' })
    }

    // Loại bỏ các Enrollment đã mua khỏi giỏ hàng
    const enrollmentsToKeep = order.Enrollments.filter(enrollment => {
      return !purchasedCourseIds.has(enrollment.courseId)
    })

    // Xóa các Enrollment đã mua khỏi cơ sở dữ liệu
    const enrollmentsToRemove = order.Enrollments.filter(enrollment => {
      return purchasedCourseIds.has(enrollment.courseId)
    })

    for (const enrollment of enrollmentsToRemove) {
      await enrollment.destroy()
    }

    // Cập nhật lại danh sách Enrollment trong đơn hàng
    order.Enrollments = enrollmentsToKeep

    // // Nếu giỏ hàng trống sau khi loại bỏ
    // if (order.Enrollments.length === 0) {
    //   await order.destroy()
    //   return res.status(200).json({ message: 'Giỏ hàng trống' })
    // }

    // Cập nhật lại totalAmount của đơn hàng
    const totalAmount = enrollmentsToKeep.reduce((sum, enrollment) => {
      return sum + parseFloat(enrollment.Course.price)
    }, 0.0)
    order.totalAmount = totalAmount.toFixed(2) // Đảm bảo định dạng số thập phân hợp lệ
    await order.save()

    // Trả về đơn hàng với thông tin giỏ hàng
    res.status(200).json(order)
  } catch (error) {
    console.error('Error fetching cart:', error)
    res.status(500).json({ message: 'Error fetching cart', error: error.message })
  }
})
// Remove a course from the cart
router.delete('/cart/remove', async (req, res) => {
  const { userId, courseId } = req.body

  try {
    // Find the pending order for the user
    const order = await models.Order.findOne({ where: { userId, status: 0 } })
    if (!order) {
      return res.status(404).json({ message: 'Giỏ hàng trống hoặc không tồn tại' })
    }

    // Find the enrollment to remove
    const enrollment = await models.Enrollment.findOne({
      where: { courseId, orderId: order.id, status: 0 } // chỗ này sửa lại status: 0 // Fix_1001
    })

    if (!enrollment) {
      return res.status(404).json({ message: 'Khóa học không có trong giỏ hàng' })
    }

    // Get the course price before deletion
    const course = await models.Course.findOne({ where: { id: courseId } })

    // Delete the enrollment
    await enrollment.destroy()

    // Update the order's total amount
    order.totalAmount -= course.price
    await order.save()

    res.status(200).json({ message: 'Khóa học đã được xóa khỏi giỏ hàng', order })
  } catch (error) {
    console.error('Error removing course from cart:', error)
    res.status(500).json({ message: 'Error removing course from cart', error: error.message })
  }
})

// Xử lý thanh toán
router.post('/payment/process', async (req, res) => {
  const { orderId, paymentMethod, amount } = req.body

  try {
    // Tìm đơn hàng chưa thanh toán
    const order = await models.Order.findOne({ where: { id: orderId, status: 0 } })

    if (!order) {
      return res.status(404).json({ message: 'Đơn hàng không tồn tại hoặc đã thanh toán' })
    }

    // Xác nhận thanh toán
    const payment = await models.Payment.create({
      orderId,
      amount,
      paymentMethod,
      paymentDate: new Date(),
      status: 'COMPLETED', // Giả định thanh toán thành công // Fix_1001
      transactionId: 'TXN' + Date.now() // Giả định transactionId từ cổng thanh toán
    })

    // Cập nhật trạng thái đơn hàng thành 'completed'
    order.status = 1 // Fix_1001
    await order.save()

    // Kích hoạt khóa học cho người dùng (cập nhật trạng thái enrollment)
    await models.Enrollment.update(
      { status: 1 }, // Kích hoạt khóa học sau khi thanh toán thành công
      { where: { orderId } }
    )

    res.status(200).json({ message: 'Thanh toán thành công', payment })
  } catch (error) {
    console.error('Error processing payment:', error)
    res.status(500).json({ message: 'Lỗi khi xử lý thanh toán', error: error.message })
  }
})

module.exports = router
