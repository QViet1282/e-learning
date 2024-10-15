const { fakerEN: faker } = require('@faker-js/faker')
const Enrollment = require('../models/enrollments')
const StudyItem = require('../models/study_item') // Thay Lession bằng StudyItem
const CourseProgress = require('../models/course_progress')

const generateEnrollmentId = async () => {
  const enrollments = await Enrollment.findAll()
  const enrollmentIds = enrollments.map(enrollment => enrollment.id)
  const randomIndex = Math.floor(Math.random() * enrollmentIds.length)
  const randomEnrollmentId = enrollmentIds[randomIndex]
  return randomEnrollmentId
}

const generateStudyItemId = async () => {
  const studyItems = await StudyItem.findAll()
  const studyItemIds = studyItems.map(item => item.id)
  const randomIndex = Math.floor(Math.random() * studyItemIds.length)
  const randomStudyItemId = studyItemIds[randomIndex]
  return randomStudyItemId
}

const generateCourseProgress = async () => {
  const usedPairs = new Set()
  const courseProgress = []

  while (courseProgress.length < 10) {
    const enrollmentId = await generateEnrollmentId()
    const studyItemId = await generateStudyItemId()
    const pair = `${enrollmentId}-${studyItemId}`

    if (!usedPairs.has(pair)) {
      usedPairs.add(pair) // Thêm dòng này để tránh lặp lại cặp
      courseProgress.push({
        enrollmentId,
        studyItemId,
        completionAt: faker.datatype.boolean(),
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
