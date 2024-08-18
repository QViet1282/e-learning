const { fakerEN: faker } = require('@faker-js/faker')
const Enrollment = require('../models/enrollments')
const Lession = require('../models/lession')
const CourseProgress = require('../models/course_progress')

const generateEnrollmentId = async () => {
  const enrollments = await Enrollment.findAll()
  const enrollmentIds = enrollments.map(enrollment => enrollment.id)
  const randomIndex = Math.floor(Math.random() * enrollmentIds.length)
  const randomEnrollmentId = enrollmentIds[randomIndex]
  return randomEnrollmentId
}

const generateLessionId = async () => {
  const lessions = await Lession.findAll()
  const lessionIds = lessions.map(lession => lession.id)
  const randomIndex = Math.floor(Math.random() * lessionIds.length)
  const randomLessionId = lessionIds[randomIndex]
  return randomLessionId
}

const generateCourseProgress = async () => {
  const usedPairs = new Set()
  const courseProgress = []

  while (courseProgress.length < 10) {
    const enrollmentId = await generateEnrollmentId()
    const lessionId = await generateLessionId()
    const pair = `${enrollmentId}-${lessionId}`

    if (!usedPairs.has(pair)) {
      courseProgress.push({
        enrollmentId,
        lessionId,
        completeation_at: faker.date.recent(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      })
    }
  }
  return courseProgress
}

const seedCourseProgress = async () => {
  try {
    const count = await CourseProgress.count()
    if (count === 0) {
      const courseProgress = await generateCourseProgress()
      await CourseProgress.bulkCreate(courseProgress, { validate: true })
    } else {
      console.log('CourseProgress table is not empty.')
    }
  } catch (error) {
    console.log(`Failed to seed CourseProgress data: ${error}`)
  }
}

module.exports = seedCourseProgress
