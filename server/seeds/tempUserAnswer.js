const { fakerEN: faker } = require('@faker-js/faker')
const Exam = require('../models/exam')
const Question = require('../models/question')
const TempUserAnswer = require('../models/tempUserAnswer')
const User = require('../models/user')

const generateQuestionId = async () => {
  const questions = await Question.findAll()
  const questionIds = questions.map(question => question.id)
  const randomIndex = Math.floor(Math.random() * questionIds.length)
  const randomQuestionId = questionIds[randomIndex]
  return randomQuestionId
}

const generateExamId = async () => {
  const exams = await Exam.findAll()
  const examIds = exams.map(exam => exam.studyItemId)
  const randomIndex = Math.floor(Math.random() * examIds.length)
  const randomExamId = examIds[randomIndex]
  return randomExamId
}

const generateUserId = async () => {
  const users = await User.findAll()
  const userIds = users.map(user => user.id)
  const randomIndex = Math.floor(Math.random() * userIds.length)
  const randomUserId = userIds[randomIndex]
  return randomUserId
}

const userAnswerExample = ['insufficient light source', 'cannot see the license plate', 'traffic light is red', 'traffic light is green', 'speeding', 'broken', 'slippery road', 'road is too crowded', 'street light is not bright', 'traffic light is yellow']

const generateTempUserAnswer = async () => {
  const usedPairs = new Set()
  const temptUserAnswers = []
  let count = 0
  while (temptUserAnswers.length < 10) {
    const examId = await generateExamId()
    const questionId = await generateQuestionId()
    const userId = await generateUserId()
    const pair = `${examId}-${questionId}-${userId}`

    if (!usedPairs.has(pair)) {
      const userAnswer = userAnswerExample[count]
      usedPairs.add(pair)
      temptUserAnswers.push({
        userId,
        examId,
        questionId,
        userAnswer,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      })
    }
    count = count + 1
  }
  return temptUserAnswers
}

const seedTempUserAnswer = async () => {
  try {
    const count = await TempUserAnswer.count()
    if (count === 0) {
      const temptUserAnswers = await generateTempUserAnswer()
      await TempUserAnswer.bulkCreate(temptUserAnswers, { validate: true })
    } else {
      console.log('TempUserAnswer table is not empty.')
    }
  } catch (error) {
    console.log(`Failed to seed TempUserAnswer data: ${error}`)
  }
}

module.exports = seedTempUserAnswer
