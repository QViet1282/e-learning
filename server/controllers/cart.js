const express = require('express')
const { models } = require('../models')
const { sequelize } = require('../models')
const router = express.Router()
const { Op } = require('sequelize')

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

    // Tìm đơn hàng đang chờ của người dùng
    let order = await models.Order.findOne({ where: { userId, status: 0 } })

    // Nếu không có đơn hàng đang chờ, tạo một đơn hàng mới
    if (!order) {
      order = await models.Order.create({
        userId,
        orderDate: new Date(),
        status: 0,
        totalAmount: 0,
        paymentMethod: 'PayOS' // Phương thức thanh toán mặc định
      })
    }

    // Kiểm tra xem khóa học đã có trong giỏ hàng chưa
    const existingEnrollment = await models.Enrollment.findOne({
      where: { courseId, orderId: order.id, status: 0 } // chỗ này sửa lại status: 0 // Fix_1001
    })

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Khóa học đã có trong giỏ hàng' })
    }

    // Thêm khóa học vào đơn hàng (enrollment)
    await models.Enrollment.create({
      courseId,
      orderId: order.id,
      enrollmentDate: new Date(),
      status: 0, // Chưa kích hoạt
      progress: 0
    })

    // Cập nhật tổng số tiền của đơn hàng
    const totalAmount = parseFloat(order.totalAmount) + parseFloat(course.price)
    order.totalAmount = totalAmount.toFixed(2)
    await order.save()

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
    // Tìm đơn hàng chưa thanh toán
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
        status: 1 // chỗ này sửa lại status: 0 // Fix_1001
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

    // Thêm rating trung bình và tên người gán vào thông tin khóa học
    order.Enrollments.forEach(enrollment => {
      enrollment.Course.dataValues.averageRating = ratingsObject[enrollment.Course.id] || 0
      enrollment.Course.dataValues.assignedByName = enrollment.Course.User.username || 'Unknown'
    })

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
