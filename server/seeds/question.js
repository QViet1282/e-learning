/* eslint-disable camelcase */
const { fakerEN: faker } = require('@faker-js/faker')
const Question = require('../models/question')
const Exam = require('../models/exam')

const instructionExamples = [
  'Chọn câu trả lời đúng:',
  'Lựa chọn đáp án phù hợp:',
  'Chọn đáp án chính xác:',
  'Chọn đáp án đúng nhất:',
  'Chọn lựa chọn phù hợp nhất:',
  'Chọn phản hồi đúng:'
]

const explanationData = [
  'HTTP là giao thức truyền tải siêu văn bản giữa máy chủ và trình duyệt.',
  'RAM là bộ nhớ tạm thời trong máy tính, giúp lưu trữ dữ liệu khi máy tính hoạt động.',
  'IP là địa chỉ định danh các thiết bị trong mạng máy tính.',
  'HTML là ngôn ngữ đánh dấu siêu văn bản, được dùng để tạo cấu trúc cho trang web.',
  'JavaScript là ngôn ngữ lập trình phía máy khách giúp tạo các tính năng động trên trang web.'
]

const contentExamples = [
  'HTTP là gì?',
  'RAM là gì?',
  'IP là gì?',
  'HTML là gì?',
  'JavaScript là gì?'
]

const answerOptions = [
  {
    a: 'Giao thức truyền tải siêu văn bản',
    b: 'Ngôn ngữ lập trình',
    c: 'Hệ điều hành',
    d: 'Phần mềm diệt virus'
  },
  {
    a: 'Bộ nhớ tạm thời',
    b: 'Bộ xử lý trung tâm',
    c: 'Ổ cứng',
    d: 'Bộ nguồn'
  },
  {
    a: 'Địa chỉ định danh trong mạng',
    b: 'Phương thức mã hóa dữ liệu',
    c: 'Giao thức kết nối internet',
    d: 'Phần mềm bảo mật'
  },
  {
    a: 'Ngôn ngữ đánh dấu siêu văn bản',
    b: 'Ngôn ngữ lập trình',
    c: 'Cơ sở dữ liệu',
    d: 'Phần mềm'
  },
  {
    a: 'Ngôn ngữ lập trình phía máy khách',
    b: 'Ngôn ngữ lập trình phía máy chủ',
    c: 'Ngôn ngữ định dạng',
    d: 'Phần mềm mã nguồn mở'
  }
]

const generateQuestions = async () => {
  const questions = []
  const exams = await Exam.findAll() // Lấy danh sách tất cả các bài thi (exams)
  const examIds = exams.map(exam => exam.studyItemId) // Lấy danh sách examId

  if (examIds.length === 0) {
    console.error('Không tìm thấy bài thi nào. Hãy seed exams trước.')
    return questions
  }

  const types = ['MULTIPLE_CHOICE', 'SINGLE_CHOICE']

  for (const examId of examIds) {
    for (let i = 0; i < 5; i++) { // Mỗi exam có 5 câu hỏi
      const content = contentExamples[i]
      const explanation = explanationData[i]
      const questionType = faker.helpers.arrayElement(types) // Chọn kiểu câu hỏi ngẫu nhiên

      let answer
      if (questionType === 'MULTIPLE_CHOICE') {
        // Chọn ngẫu nhiên từ 2 đến 4 đáp án và nối chúng bằng '::'
        const selectedAnswers = faker.helpers.arrayElements(['a', 'b', 'c', 'd'], faker.datatype.number({ min: 2, max: 4 }))
        answer = selectedAnswers.join('::')
      } else {
        // Chọn một đáp án duy nhất cho SINGLE_CHOICE
        answer = faker.helpers.arrayElement(['a', 'b', 'c', 'd'])
      }

      questions.push({
        examId, // Gán examId vào câu hỏi
        instruction: faker.helpers.arrayElement(instructionExamples),
        content,
        type: questionType,
        a: answerOptions[i].a,
        b: answerOptions[i].b,
        c: answerOptions[i].c,
        d: answerOptions[i].d,
        order: i + 1, // Gán thứ tự câu hỏi (bắt đầu từ 1)
        answer, // Đáp án được gán tùy theo kiểu câu hỏi
        explanation,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      })
    }
  }
  return questions
}

const seedQuestions = async () => {
  try {
    const count = await Question.count()
    if (count === 0) {
      const questions = await generateQuestions()
      await Question.bulkCreate(questions, { validate: true })
      console.log('Questions seeded successfully!')
    } else {
      console.log('Question table is not empty.')
    }
  } catch (error) {
    console.log(`Failed to seed Question data: ${error.message}`)
  }
}

module.exports = seedQuestions
