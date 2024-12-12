/* eslint-disable camelcase */
const { fakerEN: faker } = require('@faker-js/faker')
const Payment = require('../models/payment')
const Order = require('../models/order')

const generatePayments = async () => {
  const payments = []
  const orders = await Order.findAll()
  const orderIds = orders.map(order => order.id)

  // Kiểm tra nếu số lượng order không đủ để tạo payment
  if (orderIds.length < 10) {
    throw new Error('Not enough orders to generate unique payments')
  }

  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * orderIds.length)
    const orderId = orderIds.splice(randomIndex, 1)[0] // Lấy và loại bỏ orderId khỏi mảng
    const amount = faker.finance.amount(50, 1000, 2)
    const paymentDate = faker.date.past()
    const transactionId = faker.datatype.uuid()
    const status = faker.helpers.arrayElement(['COMPLETED', 'FAILED', 'PENDING'])
    payments.push({
      orderId,
      amount,
      paymentDate,
      paymentMethod: 'PayOS',
      transactionId,
      status,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent()
    })
  }
  return payments
}
const seedPayments = async () => {
  try {
    const count = await Payment.count()
    if (count === 0) {
      const payments = await generatePayments()
      await Payment.bulkCreate(payments, { validate: true })
    } else {
      console.log('Payments table is not empty.')
    }
  } catch (error) {
    console.log(`Failed to seed Payments data: ${error}`)
  }
}

module.exports = seedPayments
