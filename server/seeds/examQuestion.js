const { fakerEN: faker } = require('@faker-js/faker')
const ExamQuestion = require('../models/examQuestion')
const Exam = require('../models/exam')
const Question = require('../models/question')

// Sửa lại hàm generateExamId
const generateExamId = async () => {
  const exams = await Exam.findAll() // Thay đổi biến tên cho dễ hiểu
  const examIds = exams.map(exam => exam.id) // Lấy danh sách examId
  if (examIds.length === 0) {
    throw new Error('No exams found in the database.') // Thêm kiểm tra nếu không có dữ liệu
  }
  const randomIndex = Math.floor(Math.random() * examIds.length)
  return examIds[randomIndex] // Trả về một examId hợp lệ
}

// Sửa lại hàm generateQuestionId
const generateQuestionId = async () => {
  const questions = await Question.findAll() // Thay đổi biến tên cho dễ hiểu
  const questionIds = questions.map(question => question.id) // Lấy danh sách questionId
  if (questionIds.length === 0) {
    throw new Error('No questions found in the database.') // Thêm kiểm tra nếu không có dữ liệu
  }
  const randomIndex = Math.floor(Math.random() * questionIds.length)
  return questionIds[randomIndex] // Trả về một questionId hợp lệ
}

const generateExamQuestion = async () => {
  const usedPairs = new Set()
  const examQuestions = []

  while (examQuestions.length < 6) {
    const examId = await generateExamId()
    const questionId = await generateQuestionId()

    // Kiểm tra dữ liệu trước khi thêm vào examQuestions
    if (!examId || !questionId) {
      console.log(`Invalid data: examId = ${examId}, questionId = ${questionId}`)
      continue
    }

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
