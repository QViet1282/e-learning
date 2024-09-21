/* eslint-disable camelcase */
const { fakerEN: faker } = require('@faker-js/faker')
const OrderItem = require('../models/orderItem')
const Order = require('../models/order')
const Course = require('../models/course')

const generateOrderId = async () => {
  const orders = await Order.findAll()
  const orderIds = orders.map(order => order.id)
  const randomIndex = Math.floor(Math.random() * orderIds.length)
  const randomOrderId = orderIds[randomIndex]
  return randomOrderId
}

const generateCourseId = async () => {
  const courses = await Course.findAll()
  const courseIds = courses.map(course => course.id)
  const randomIndex = Math.floor(Math.random() * courseIds.length)
  const randomCourseId = courseIds[randomIndex]
  return randomCourseId
}

const generateOrderItems = async () => {
  const orderItems = []
  for (let i = 0; i < 10; i++) {
    const orderId = await generateOrderId()
    const courseId = await generateCourseId()
    const quantity = faker.datatype.number({ min: 1, max: 5 })
    const price = faker.finance.amount(20, 300, 2)
    orderItems.push({
      orderId,
      courseId,
      quantity,
      price,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent()
    })
  }
  return orderItems
}

const seedOrderItems = async () => {
  try {
    const count = await OrderItem.count()
    if (count === 0) {
      const orderItems = await generateOrderItems()
      await OrderItem.bulkCreate(orderItems, { validate: true })
    } else {
      console.log('OrderItems table is not empty.')
    }
  } catch (error) {
    console.log(`Failed to seed OrderItems data: ${error}`)
  }
}

module.exports = seedOrderItems
