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
  'JavaScript là ngôn ngữ lập trình phía máy khách giúp tạo các tính năng động trên trang web.',
  'CSS là ngôn ngữ định kiểu được sử dụng để mô tả giao diện của một tài liệu viết bằng HTML.',
  'SQL là ngôn ngữ truy vấn được sử dụng để giao tiếp với cơ sở dữ liệu.',
  'Python là ngôn ngữ lập trình bậc cao được sử dụng cho nhiều mục đích khác nhau.',
  'React là một thư viện JavaScript để xây dựng giao diện người dùng.',
  'Node.js là một môi trường chạy JavaScript phía máy chủ.'
]

const singleChoiceContentExamples = [
  'HTTP là gì?',
  'RAM là gì?',
  'IP là gì?',
  'HTML là gì?',
  'JavaScript là gì?'
]

const multipleChoiceContentExamples = [
  'CSS là gì?',
  'SQL là gì?',
  'Python là gì?',
  'React là gì?',
  'Node.js là gì?'
]

const singleChoiceAnswerOptions = [
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

const multipleChoiceAnswerOptions = [
  {
    a: 'Ngôn ngữ định kiểu',
    b: 'Ngôn ngữ lập trình',
    c: 'Hệ điều hành',
    d: 'Phần mềm diệt virus'
  },
  {
    a: 'Ngôn ngữ truy vấn',
    b: 'Ngôn ngữ lập trình',
    c: 'Giao thức kết nối internet',
    d: 'Phần mềm bảo mật'
  },
  {
    a: 'Ngôn ngữ lập trình bậc cao',
    b: 'Ngôn ngữ lập trình bậc thấp',
    c: 'Ngôn ngữ định kiểu',
    d: 'Phần mềm mã nguồn mở'
  },
  {
    a: 'Thư viện JavaScript',
    b: 'Ngôn ngữ lập trình',
    c: 'Cơ sở dữ liệu',
    d: 'Phần mềm'
  },
  {
    a: 'Môi trường chạy JavaScript phía máy chủ',
    b: 'Ngôn ngữ lập trình',
    c: 'Hệ điều hành',
    d: 'Phần mềm diệt virus'
  }
]

const singleChoiceCorrectAnswers = [
  'a',
  'a',
  'a',
  'a',
  'a'
]

const multipleChoiceCorrectAnswers = [
  'a::b',
  'a::c',
  'a::d',
  'a::b',
  'a::c'
]

const generateQuestions = async () => {
  const questions = []
  const exams = await Exam.findAll() // Lấy danh sách tất cả các bài thi (exams)
  const examIds = exams.map(exam => exam.studyItemId) // Lấy danh sách examId

  if (examIds.length === 0) {
    console.error('Không tìm thấy bài thi nào. Hãy seed exams trước.')
    return questions
  }

  for (const examId of examIds) {
    for (let i = 0; i < 5; i++) { // Mỗi exam có 5 câu hỏi
      const questionType = i % 2 === 0 ? 'SINGLE_CHOICE' : 'MULTIPLE_CHOICE' // Xen kẽ giữa SINGLE_CHOICE và MULTIPLE_CHOICE
      const content = questionType === 'SINGLE_CHOICE' ? singleChoiceContentExamples[i % 5] : multipleChoiceContentExamples[i % 5]
      const explanation = explanationData[i % 10]
      const answerOptions = questionType === 'SINGLE_CHOICE' ? singleChoiceAnswerOptions[i % 5] : multipleChoiceAnswerOptions[i % 5]
      const answer = questionType === 'SINGLE_CHOICE' ? singleChoiceCorrectAnswers[i % 5] : multipleChoiceCorrectAnswers[i % 5]

      questions.push({
        examId, // Gán examId vào câu hỏi
        instruction: faker.helpers.arrayElement(instructionExamples),
        content,
        type: questionType,
        a: answerOptions.a,
        b: answerOptions.b,
        c: answerOptions.c,
        d: answerOptions.d,
        order: i + 1, // Gán thứ tự câu hỏi (bắt đầu từ 1)
        answer, // Đáp án chính xác
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
