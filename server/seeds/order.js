/* eslint-disable camelcase */
const { fakerEN: faker } = require('@faker-js/faker')
const Order = require('../models/order')
const User = require('../models/user')

const generateUserId = async () => {
  const users = await User.findAll()
  const userIds = users.map(user => user.id)
  const randomIndex = Math.floor(Math.random() * userIds.length)
  const randomUserId = userIds[randomIndex]
  return randomUserId
}

const generateOrder = async () => {
  const orders = []
  for (let i = 0; i < 10; i++) {
    const userId = await generateUserId()
    const orderDate = faker.date.past()
    const totalAmount = faker.finance.amount(50, 1000, 2)
    orders.push({
      userId,
      orderDate,
      totalAmount,
      status: true,
      paymentMethod: 'PayOS',
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent()
    })
  }
  return orders
}

const seedOrder = async () => {
  try {
    const count = await Order.count()
    if (count === 0) {
      const orders = await generateOrder()
      await Order.bulkCreate(orders, { validate: true })
    } else {
      console.log('Order table is not empty.')
    }
  } catch (error) {
    console.log(`Failed to seed Order data: ${error}`)
  }
}

module.exports = seedOrder
