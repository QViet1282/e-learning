// routes/payment.js

const express = require('express')
const router = express.Router()
const payOS = require('../payos')
const { models } = require('../models')

// Process payment and create PayOS payment link
router.post('/process', async (req, res) => {
  const { userId, amount } = req.body.data

  try {
    // Find the user's pending order
    const order = await models.Order.findOne({ where: { userId, status: 'pending' } })

    if (!order) {
      return res.status(404).json({ message: 'No pending order found for the user' })
    }

    const body = {
      orderCode: Number(String(Date.now()).slice(-6)),
      amount,
      description: `Thanh toan don hang ${order.id}`, // Include orderId in description
      returnUrl: process.env.FRONTEND_URL + '/payment-success', // Update with your frontend domain
      cancelUrl: process.env.FRONTEND_URL + '/cart'
    }
    // Log đối tượng body để kiểm tra các thuộc tính
    console.log('Payment link request body:', body)

    // Xác thực đối tượng body
    if (!body.orderCode || !body.amount || !body.description || !body.returnUrl || !body.cancelUrl) {
      return res.status(400).send('Invalid payment link request body')
    }

    const paymentLinkResponse = await payOS.createPaymentLink(body)

    res.status(200).json({ checkoutUrl: paymentLinkResponse.checkoutUrl })
  } catch (error) {
    console.error('Error processing payment:', error)
    res.status(500).json({ message: 'Error processing payment', error: error.message })
  }
})

// Handle PayOS payment webhook
router.post('/payos-webhook', async (req, res) => {
  try {
    console.log('Payment webhook received------------------------')
    console.log('Webhook body:', req.body)
    const webhookData = payOS.verifyPaymentWebhookData(req.body)
    console.log('Webhook data:', webhookData)
    const { amount, desc, description } = webhookData

    // Extract orderId from description
    const orderIdMatch = description.match(/Thanh toan don hang (\d+)/)
    if (!orderIdMatch) {
      console.error('Order ID not found in description')
      return res.status(400).json({ message: 'Order ID not found in description' })
    }
    const orderId = orderIdMatch[1]
    console.log('Order ID:', orderId)
    // Find the order by orderId
    const order = await models.Order.findOne({ where: { id: orderId } })
    console.log('check 1')
    if (!order) {
      console.error('Order not found for orderId:', orderId)
      return res.status(404).json({ message: 'Order not found' })
    }
    console.log('check 2')
    if (desc === 'success') {
      // Payment was successful
      // Update the order status
      order.status = 'completed'
      await order.save()
      console.log('check 3')
      // Create a payment record
      await models.Payment.create({
        orderId: order.id,
        amount,
        paymentMethod: 'PayOS',
        paymentDate: new Date(),
        status: 'completed',
        transactionId: webhookData.paymentLinkId
      })
      console.log('check 4')
      // Activate enrollments
      await models.Enrollment.update(
        { status: 1 }, // Activate the course after successful payment
        { where: { orderId: order.id } }
      )
      console.log('check 5')
      res.json({ message: 'Payment processed successfully' })
    } else {
      // Payment failed or other status
      console.error('Payment failed for orderId:', orderId)
      res.status(400).json({ message: 'Payment failed or invalid status' })
    }
  } catch (error) {
    console.error('Error processing payment webhook:', error)
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
