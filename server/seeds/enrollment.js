/* eslint-disable camelcase */
const { fakerEN: faker } = require('@faker-js/faker')
const Enrollment = require('../models/enrollments')
const Course = require('../models/course')
const Order = require('../models/order')

const generateCourseId = async () => {
  const courses = await Course.findAll()
  const courseIds = courses.map(course => course.id)
  const randomIndex = Math.floor(Math.random() * courseIds.length)
  return courseIds[randomIndex]
}

const generateOrderId = async () => {
  const orders = await Order.findAll()
  const orderIds = orders.map(order => order.id)
  if (orderIds.length === 0) {
    throw new Error('No orders available to assign to enrollments')
  }
  const randomIndex = Math.floor(Math.random() * orderIds.length)
  return orderIds[randomIndex]
}

const generateEnrollment = async () => {
  const usedPairs = new Set()
  const enrollments = []

  while (enrollments.length < 10) {
    const courseId = await generateCourseId()
    const orderId = await generateOrderId()
    const pair = `${orderId}-${courseId}`

    if (!usedPairs.has(pair)) {
      usedPairs.add(pair)
      const enrollmentDate = faker.date.past()
      enrollments.push({
        courseId,
        orderId,
        enrollmentDate,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        status: false,
        completedDate: null,
        progress: 0,
        rating: faker.datatype.number({ min: 1, max: 5 }),
        comment: faker.lorem.sentence(),
        ratingDate: faker.date.recent()
      })
    }
  }
  return enrollments
}

const seedEnrollment = async () => {
  try {
    const count = await Enrollment.count()
    if (count === 0) {
      const enrollments = await generateEnrollment()
      await Enrollment.bulkCreate(enrollments, { validate: true })
      console.log('Enrollments seeded successfully!')
    } else {
      console.log('Enrollment table is not empty.')
    }
  } catch (error) {
    console.log(`Failed to seed Enrollment data: ${error.message}`)
  }
}

module.exports = seedEnrollment
