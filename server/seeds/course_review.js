/* eslint-disable camelcase */
const { fakerEN: faker } = require('@faker-js/faker')
const CourseReview = require('../models/course_review')
const Enrollment = require('../models/enrollments')
const Course = require('../models/course')

const generateEnrollId = async () => {
  const enrollments = await Enrollment.findAll()
  const enrollIds = enrollments.map(enrollment => enrollment.id)
  const randomIndex = Math.floor(Math.random() * enrollIds.length)
  return enrollIds[randomIndex]
}

const generateCourseId = async () => {
  const courses = await Course.findAll()
  const courseIds = courses.map(course => course.id)
  const randomIndex = Math.floor(Math.random() * courseIds.length)
  return courseIds[randomIndex]
}

const generateCourseReviews = async () => {
  const reviews = []
  for (let i = 0; i < 10; i++) {
    const enrollId = await generateEnrollId()
    const courseId = await generateCourseId()
    const rating = faker.datatype.number({ min: 1, max: 5 })
    const comment = faker.lorem.sentences(3)
    reviews.push({
      enrollId,
      courseId,
      rating,
      comment,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent()
    })
  }
  return reviews
}

const seedCourseReviews = async () => {
  try {
    const count = await CourseReview.count()
    if (count === 0) {
      const reviews = await generateCourseReviews()
      await CourseReview.bulkCreate(reviews, { validate: true })
      console.log('Course reviews seeded successfully.')
    } else {
      console.log('CourseReviews table is not empty.')
    }
  } catch (error) {
    console.log(`Failed to seed CourseReview data: ${error}`)
  }
}

module.exports = seedCourseReviews
