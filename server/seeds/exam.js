const { fakerEN: faker } = require('@faker-js/faker')
const Exam = require('../models/exam')
const StudyItem = require('../models/study_item')
const User = require('../models/user')

const generateUserId = async () => {
  const users = await User.findAll()
  const userIds = users.map(user => user.id)
  const randomIndex = Math.floor(Math.random() * userIds.length)
  return userIds[randomIndex]
}

const generateExams = async () => {
  const exams = []
  const studyItems = await StudyItem.findAll({ where: { itemType: 'exam' } })

  for (const studyItem of studyItems) {
    const studyItemId = studyItem.id

    exams.push({
      studyItemId, // Sử dụng studyItemId từ StudyItem
      durationInMinute: faker.number.int({ min: 30, max: 120 }),
      pointToPass: faker.number.int({ min: 50, max: 100 }),
      createrId: await generateUserId(),
      numberOfAttempt: faker.number.int({ min: 1, max: 3 }),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent()
    })
  }

  return exams
}

const seedExams = async () => {
  try {
    const count = await Exam.count()
    if (count === 0) {
      const exams = await generateExams()
      await Exam.bulkCreate(exams, { validate: true })
      console.log('Exam data seeded successfully.')
    } else {
      console.log('Exam table is not empty.')
    }
  } catch (error) {
    console.log(`Failed to seed Exam data: ${error}`)
  }
}

module.exports = seedExams
