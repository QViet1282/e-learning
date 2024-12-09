// routes/payment.js

const express = require('express')
const router = express.Router()
const payOS = require('../payos')
const { sequelize, models } = require('../models')
// const { models } = require('../models')
// Process payment and create PayOS payment link
router.post('/process', async (req, res) => {
  const { userId, amount } = req.body.data

  try {
    // Tìm giỏ hàng đang chờ thanh toán của người dùng
    const order = await models.Order.findOne({
      where: { userId, status: 0 }, // Giỏ hàng chờ thanh toán
      include: [{
        model: models.Enrollment,
        include: [models.Course] // Include Course để lấy thông tin chi tiết khóa học
      }]
    })

    if (!order) {
      return res.status(404).json({ message: 'No pending order found for the user' })
    }

    order.status = 2 // Hoặc trạng thái bạn định nghĩa cho "Đang thanh toán"
    await order.save() // Không sử dụng transaction ở đây

    // Map các khóa học và chuẩn bị thông tin thanh toán
    const items = order.Enrollments.map(item => ({
      name: item.Course.name,
      quantity: 1, // Giả sử mỗi enrollment chỉ có một khóa học
      price: parseFloat(item.Course.price) // Đảm bảo giá là một số hợp lệ
    }))

    // Tạo orderSnapshot dưới dạng chuỗi các id khóa học cách nhau bằng dấu phẩy
    const orderSnapshot = order.Enrollments.map(item => item.Course.id).join(',')

    const body = {
      orderCode: Number(String(Date.now()).slice(-6)), // Generate orderCode dựa trên timestamp
      amount,
      description: `Thanh toan don hang ${order.id}`, // Bao gồm orderId trong mô tả
      items,
      returnUrl: process.env.FRONTEND_URL + '/payment-success', // Cập nhật với domain frontend của bạn
      cancelUrl: process.env.FRONTEND_URL + '/cart'
    }

    // Kiểm tra lại các trường trong body
    console.log('Payment link request body:', body)

    if (!body.orderCode || !body.amount || !body.description || !body.returnUrl || !body.cancelUrl) {
      return res.status(400).send('Invalid payment link request body')
    }

    // Gọi đến dịch vụ thanh toán bên ngoài để tạo link thanh toán
    const paymentLinkResponse = await payOS.createPaymentLink(body)

    // Tạo bản ghi thanh toán trong cơ sở dữ liệu
    await models.Payment.create({
      orderId: order.id,
      amount,
      paymentMethod: 'PayOS',
      paymentDate: new Date(),
      status: 'PENDING', // Trạng thái ban đầu là chờ
      transactionId: paymentLinkResponse.paymentLinkId,
      orderSnapshot // Lưu chuỗi id của các khóa học
    })

    // Trả về URL thanh toán
    res.status(200).json({ checkoutUrl: paymentLinkResponse.checkoutUrl })
  } catch (error) {
    console.error('Error processing payment:', error)
    res.status(500).json({ message: 'Error processing payment', error: error.message })
  }
})

router.get('/check-cancel/:transactionId', async (req, res) => {
  try {
    // Lấy thông tin thanh toán từ PayOS bằng transactionId
    const paymentInfo = await payOS.getPaymentLinkInformation(req.params.transactionId)
    console.log('Payment info:', paymentInfo)
    if (!paymentInfo) {
      return res.status(404).json({
        error: -1,
        message: 'Failed to retrieve payment information',
        data: null
      })
    }

    // Kiểm tra nếu trạng thái là "CANCELLED"
    const { status, id: transactionId } = paymentInfo
    if (status === 'CANCELLED') {
      // Tìm bản ghi Payment trong cơ sở dữ liệu dựa trên transactionId
      const payment = await models.Payment.findOne({ where: { transactionId } })
      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' })
      }
      // Tìm đơn hàng liên kết với Payment
      const order = await models.Order.findOne({ where: { id: payment.orderId, status: 2 } })
      if (!order) {
        return res.status(404).json({ message: 'Order not found or already processed' })
      }

      await models.Order.update(
        { status: 0 }, // Đặt lại trạng thái đơn hàng về "Chưa thanh toán"
        { where: { id: order.id } }
      )

      // Cập nhật trạng thái Payment và Order trong database
      await models.Payment.update(
        { status: 'CANCELED' },
        { where: { id: payment.id } }
      )

      return res.json({
        error: 0,
        message: 'Payment was canceled',
        data: paymentInfo
      })
    } else {
      return res.json({
        error: 0,
        message: 'Payment is not canceled',
        data: paymentInfo
      })
    }
  } catch (error) {
    console.log('Error checking payment cancellation:', error)
    return res.status(500).json({
      error: -1,
      message: 'Failed to check payment cancellation',
      data: null
    })
  }
})

// Lấy lịch sử mua hàng cho từng user
router.get('/purchase-history/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    // Tìm tất cả các đơn hàng đã hoàn thành (status = 1) của user
    const orders = await models.Order.findAll({
      where: { userId, status: 1 },
      include: [
        {
          model: models.Payment,
          attributes: ['paymentDate', 'paymentMethod', 'amount'], // Chỉ lấy các trường cần thiết từ Payment
          where: { status: 'COMPLETED' },
          required: false
        },
        {
          model: models.Enrollment,
          where: { status: 1 },
          include: [
            {
              model: models.Course,
              attributes: ['name', 'price', 'locationPath'] // Chỉ lấy các trường cần thiết từ Course
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    })

    if (!orders || orders.length === 0) {
      // return res.status(404).json({ message: 'No purchase history found for this user.' })
      return res.status(200).json({ message: 'No purchase history found for this user.', data: [] })
    }

    res.json({ error: 0, message: 'Success', data: orders })
  } catch (error) {
    console.error('Error fetching purchase history:', error)
    res.status(500).json({ error: -1, message: 'Failed to fetch purchase history' })
  }
})

// // Handle PayOS payment webhook v1 -đã check đúng
// router.post('/payos-webhook', async (req, res) => {
//   try {
//     console.log('Payment webhook received------------------------')
//     console.log('Webhook body:', req.body)
//     const webhookData = payOS.verifyPaymentWebhookData(req.body)
//     console.log('Webhook data:', webhookData)
//     const { amount, desc, description } = webhookData

//     // Extract orderId from description
//     const orderIdMatch = description.match(/Thanh toan don hang (\d+)/)
//     if (!orderIdMatch) {
//       console.error('Order ID not found in description')
//       return res.status(400).json({ message: 'Order ID not found in description' })
//     }
//     const orderId = orderIdMatch[1]
//     console.log('Order ID:', orderId)
//     // Find the order by orderId
//     const order = await models.Order.findOne({ where: { id: orderId, status: 0 } }) // chỗ này sửa lại status: 0 // Fix_1001
//     console.log('check 1')
//     if (!order) {
//       console.error('Order not found for orderId:', orderId)
//       return res.status(404).json({ message: 'Order not found' })
//     }
//     console.log('check 2')
//     if (desc === 'success') {
//       // Tìm bản ghi Payment hiện tại theo orderId và trạng thái 'PENDING'
//       let payment = await models.Payment.findOne({
//         where: { orderId: order.id, status: 'PENDING' }
//       })
//       console.log('check 3')
//       console.log('Payment:', payment)
//       if (payment) {
//         // Chỉ cập nhật transactionId nếu chưa có giá trị
//         if (!payment.transactionId) {
//           payment.transactionId = webhookData.paymentLinkId
//         }
//         payment.status = 'COMPLETED' // Cập nhật trạng thái Payment thành 'COMPLETED'
//         payment.paymentDate = new Date()
//         await payment.save()
//       } else {
//         // Nếu chưa có bản ghi Payment, tạo một bản ghi mới
//         console.log('Check 4.5')
//         payment = await models.Payment.create({
//           orderId: order.id,
//           amount,
//           paymentMethod: 'PayOS',
//           paymentDate: new Date(),
//           status: 'COMPLETED',
//           transactionId: webhookData.paymentLinkId
//         })
//       }
//       console.log('check 4.6')
//       // Cập nhật trạng thái đơn hàng
//       order.status = 1
//       await order.save()
//       console.log('check 4.7')
//       await models.Enrollment.update(
//         { status: 1 }, // Activate the course after successful payment
//         { where: { orderId: order.id } }
//       )
//       console.log('check 5')
//       res.json({ message: 'Payment processed successfully' })
//     } else {
//       // Payment failed or other status
//       console.error('Payment failed for orderId:', orderId)
//       res.status(400).json({ message: 'Payment failed or invalid status' })
//     }
//   } catch (error) {
//     console.error('Error processing payment webhook:', error)
//     res.status(500).json({ message: 'Error processing payment webhook', error: error.message })
//   }
// })

// Handle PayOS payment webhook v2 - fix không dùng description để lấy orderId
router.post('/payos-webhook', async (req, res) => {
  const transaction = await sequelize.transaction() // Khởi tạo transaction

  try {
    console.log('Payment webhook received------------------------')
    console.log('Webhook body:', req.body)

    const webhookData = payOS.verifyPaymentWebhookData(req.body)
    console.log('Webhook data:', webhookData)

    const desc = webhookData.desc
    const paymentLinkId = webhookData.paymentLinkId // Sử dụng paymentLinkId thay vì transactionId
    if (!paymentLinkId) {
      console.error('Payment Link ID is missing')
      return res.status(400).json({ message: 'Payment Link ID is missing' })
    }
    // Tìm bản ghi Payment trong cơ sở dữ liệu dựa trên paymentLinkId
    const payment = await models.Payment.findOne({ where: { transactionId: paymentLinkId }, transaction })
    if (!payment) {
      console.error('Payment not found for paymentLinkId:', paymentLinkId)
      return res.status(404).json({ message: 'Payment not found' })
    }

    // Lấy orderId từ Payment
    const orderId = payment.orderId
    if (!orderId) {
      console.error('Order ID is missing')
      return res.status(400).json({ message: 'Order ID is missing' })
    }
    // Tìm đơn hàng liên kết với orderId
    // const order = await models.Order.findOne({ where: { id: orderId, status: 0 }, transaction })
    const order = await models.Order.findOne({
      where: { id: orderId, status: 2 }, // Đơn hàng chưa thanh toán
      transaction,
      lock: transaction.LOCK.UPDATE // Khóa dòng đơn hàng trong khi thanh toán đang xử lý
    })

    if (!order) {
      console.error('Order not found or already processed for orderId:', orderId)
      return res.status(404).json({ message: 'Order not found or already processed' })
    }

    // Xử lý thanh toán thành công
    if (desc === 'success') {
      // Cập nhật trạng thái Payment và Order trong database
      payment.status = 'COMPLETED'
      payment.paymentDate = new Date()
      await payment.save({ transaction })

      // Cập nhật trạng thái Order
      order.status = 1 // Đã thanh toán
      await order.save({ transaction })

      // Kích hoạt các khóa học liên quan
      await models.Enrollment.update(
        { status: 1, enrollmentDate: new Date() }, // Kích hoạt khóa học sau khi thanh toán thành công
        { where: { orderId: order.id }, transaction }
      )

      // Cập nhật pendingRevenue cho các người dùng được chỉ định (assignedBy) từ các khóa học đã thanh toán
      const enrollments = await models.Enrollment.findAll({ where: { orderId: order.id }, transaction })

      for (const enrollment of enrollments) {
        // Truy vấn bảng Course để lấy giá của khóa học
        const course = await models.Course.findOne({
          where: { id: enrollment.courseId }, // Giả sử mỗi Enrollment đều có trường courseId
          transaction
        })
        if (!course) {
          console.error('Course not found for courseId:', enrollment.courseId)
          return // Hoặc xử lý lỗi nếu không tìm thấy khóa học
        }
        if (course) {
          const user = await models.User.findOne({
            where: { id: course.assignedBy }, // Lấy assignedBy từ bảng Course
            transaction,
            lock: transaction.LOCK.UPDATE // Sử dụng khóa dòng dữ liệu
          })
          if (!user) {
            console.error('User not found for assignedBy:', enrollment.assignedBy)
            return // Hoặc xử lý lỗi nếu không tìm thấy người dùng
          }
          if (user) {
            console.log('Updating pendingRevenue for user:', user.id)
            console.log('Course price:', course.price)
            console.log('User pendingRevenue:', user.pendingRevenue)

            // Đảm bảo giá trị là một số hợp lệ
            const coursePrice = parseFloat(course.price) // Chuyển thành số
            if (isNaN(coursePrice)) {
              console.error('Invalid course price:', course.price)
              return // Dừng lại nếu giá trị không hợp lệ
            }

            // Đảm bảo user.pendingRevenue là số
            user.pendingRevenue = parseFloat(user.pendingRevenue) || 0 // Chuyển thành số nếu chưa phải là số

            // Cộng giá trị vào pendingRevenue
            user.pendingRevenue += coursePrice // Cộng trực tiếp, không cần làm tròn vì coursePrice đã là số hợp lệ

            // Lưu lại thông tin người dùng với giá trị mới của pendingRevenue
            await user.save({ transaction })

            console.log('Updated pendingRevenue:', user.pendingRevenue)
          }
        }
      }

      // Commit giao dịch khi tất cả các bước đều thành công
      await transaction.commit()

      res.json({ message: 'Payment processed successfully' })
    } else {
      // Payment failed or other status
      console.error('Payment failed for orderId:', orderId)
      res.status(400).json({ message: 'Payment failed or invalid status' })
    }
  } catch (error) {
    // Nếu có lỗi, rollback giao dịch
    console.error('Error processing payment webhook:', error)
    await transaction.rollback()
    res.status(500).json({ message: 'Error processing payment webhook', error: error.message })
  }
})

// B1:đầu tiên sẽ chạy API này trước đóng API trên lại sau khi báo thành công thì sẽ chạy API ở trên
// B2: chạy ứng dụng
// B3: thực hiện thanh toán
// B4: chờ kết quả -> thanh toán thành công
// B5: chạy ngrok http 8000
// B6: copy link ngrok http://xxxxxx/api/v1/payment/payos-webhook
// B7: vào tài khoản PayOS -> cài đặt Webhook -> paste link vào -> lưu -> kiểm tra kết nối
// B8: sau đó mở API trên lêN => hoàn tất
// router.post('/payos-webhook', async function (req, res) {
//   console.log('Received a request at /payos')
//   console.log('Request body:', req.body)
//   const webhookData = payOS.verifyPaymentWebhookData(req.body)

//   if (
//     ['Ma giao dich thu nghiem', 'VQRIO123'].includes(webhookData.description)
//   ) {
//     return res.json({
//       error: 0,
//       message: 'Ok',
//       data: webhookData
//     })
//   }

//   // Source code uses webhook data - nghĩa là dùng dữ liệu từ webhook để xử lý gì đó (ví dụ: cập nhật trạng thái đơn hàng)
//   // ở đây mình chỉ log ra thôi
//   console.log(webhookData)

//   return res.json({
//     error: 0,
//     message: 'Ok',
//     data: webhookData
//   })
// })

module.exports = router
