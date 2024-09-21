/* eslint-disable camelcase */
const { fakerEN: faker } = require('@faker-js/faker')
const Payment = require('../models/payment')
const Order = require('../models/order')

const generateOrderId = async () => {
  const orders = await Order.findAll()
  const orderIds = orders.map(order => order.id)
  const randomIndex = Math.floor(Math.random() * orderIds.length)
  const randomOrderId = orderIds[randomIndex]
  return randomOrderId
}

const generatePayments = async () => {
  const payments = []
  for (let i = 0; i < 10; i++) {
    const orderId = await generateOrderId()
    const amount = faker.finance.amount(50, 1000, 2)
    const paymentDate = faker.date.past()
    const paymentMethod = faker.helpers.arrayElement(['Credit Card', 'PayPal', 'Bank Transfer'])
    const transactionId = faker.datatype.uuid()
    const status = faker.helpers.arrayElement(['Completed', 'Failed', 'Pending'])
    payments.push({
      orderId,
      amount,
      paymentDate,
      paymentMethod,
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
