const { fakerEN: faker } = require('@faker-js/faker')
const ExamQuestion = require('../models/examQuestion')
const Exam = require('../models/exam')
const Question = require('../models/question')

const generateExamId = async () => {
  const users = await Exam.findAll()
  const userIds = users.map(user => user.id)
  const randomIndex = Math.floor(Math.random() * userIds.length)
  const randomUserId = userIds[randomIndex]
  return randomUserId
}

const generateQuestionId = async () => {
  const courses = await Question.findAll()
  const courseIds = courses.map(course => course.id)
  const randomIndex = Math.floor(Math.random() * courseIds.length)
  const randomCourseId = courseIds[randomIndex]
  return randomCourseId
}

const generateExamQuestion = async () => {
  const usedPairs = new Set()
  const examQuestions = []

  while (examQuestions.length < 6) {
    const examId = await generateExamId()
    const questionId = await generateQuestionId()
    const pair = `${examId}-${questionId}`

    if (!usedPairs.has(pair)) {
      usedPairs.add(pair)
      examQuestions.push({
        examId,
        questionId,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      })
    }
  }
  return examQuestions
}

const seedExamQuestion = async () => {
  try {
    const count = await ExamQuestion.count()
    if (count === 0) {
      const examQuestions = await generateExamQuestion()
      await ExamQuestion.bulkCreate(examQuestions, { validate: true })
    } else {
      console.log('ExamQuestion table is not empty.')
    }
  } catch (error) {
    console.log(`Failed to seed ExamQuestion data: ${error}`)
  }
}

module.exports = seedExamQuestion
