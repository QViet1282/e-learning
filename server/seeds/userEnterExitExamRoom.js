const { fakerEN: faker } = require('@faker-js/faker')
const UserEnterExitExamRoom = require('../models/userEnterExitExamRoom')
const User = require('../models/user')
const Exam = require('../models/exam')

const generateUserId = async () => {
  const users = await User.findAll()
  const userIds = users.map(user => user.id)
  const randomIndex = Math.floor(Math.random() * userIds.length)
  const randomUserId = userIds[randomIndex]
  return randomUserId
}

const generateExamId = async () => {
  const exams = await Exam.findAll()
  const examIds = exams.map(exam => exam.id)
  const randomIndex = Math.floor(Math.random() * examIds.length)
  const randomExamId = examIds[randomIndex]
  return randomExamId
}

const generateUserEnterExitExamRooms = async () => {
  const usedPairs = new Set()
  const userEnterExitExamRooms = []

  while (userEnterExitExamRooms.length < 6) {
    const userId = await generateUserId()
    const examId = await generateExamId()
    const pair = `${userId}-${examId}`

    if (!usedPairs.has(pair)) {
      usedPairs.add(pair)
      userEnterExitExamRooms.push({
        userId,
        examId,
        enterTime: faker.date.past(),
        exitTime: faker.date.recent(),
        attempt: faker.number.int({ min: 1, max: 3 }),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      })
    }
  }
  return userEnterExitExamRooms
}

const seedUserEnterExitExamRooms = async () => {
  try {
    const count = await UserEnterExitExamRoom.count()
    if (count === 0) {
      const userEnterExitExamRooms = await generateUserEnterExitExamRooms()
      await UserEnterExitExamRoom.bulkCreate(userEnterExitExamRooms, { validate: true })
    } else {
      console.log('UserEnterExitExamRoom table is not empty.')
    }
  } catch (error) {
    console.log(`Failed to seed UserEnterExitExamRoom data: ${error}`)
  }
}

module.exports = seedUserEnterExitExamRooms
