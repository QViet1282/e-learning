/* eslint-disable no-unused-vars */
/* eslint-disable no-empty */
/* eslint-disable brace-style */
const express = require('express')
const { models } = require('../models')
// const { isAuthenticated } = require('../middlewares/authentication')
const router = express.Router()

// Tạo mới kỳ thi, câu hỏi và liên kết giữa kỳ thi và câu hỏi
router.post('/', async (req, res) => {
  try {
    // Tạo mới kỳ thi
    const newExam = await createExam()

    // Tạo mới các câu hỏi dựa trên dữ liệu từ yêu cầu
    const newQuestions = await createQuestions(req)

    // Liên kết kỳ thi với các câu hỏi vừa tạo
    const examQuestion = await linkExamQuestion(newExam, newQuestions)

    // Trả về kết quả liên kết giữa kỳ thi và câu hỏi
    res.json({
      examQuestion
    })
  } catch (error) {
    res.json(error) // Trả về lỗi nếu có
  }
})

module.exports = router

// Tạo các câu hỏi mới từ dữ liệu yêu cầu
async function createQuestions (req) {
  const questionsData = [] // Mảng chứa dữ liệu câu hỏi

  // Duyệt qua các phần tử trong body request để lấy thông tin câu hỏi
  req.body.results.forEach((element) => {
    const { a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p } = getOptions(element) // Lấy các tùy chọn trả lời cho câu hỏi
    const type = getQuestionType(element) // Xác định loại câu hỏi (chọn 1 hoặc chọn nhiều)
    const answer = element.correct_response.join('::') // Lưu đáp án chính xác dưới dạng chuỗi

    // Định dạng câu hỏi
    const question = {
      content: beautifyText(element.prompt.question), // Nội dung câu hỏi sau khi được làm đẹp
      instruction: 'Choose the best answer.', // Lời hướng dẫn trả lời
      type, // Loại câu hỏi (SINGLE_CHOICE hoặc MULTIPLE_CHOICE)
      a,
      b,
      c,
      d,
      e,
      f,
      g,
      h,
      i,
      j,
      k,
      l,
      m,
      n,
      o,
      p, // Các tùy chọn trả lời
      answer, // Đáp án chính xác
      explanation: element.prompt.explanation // Giải thích cho câu hỏi
    }

    questionsData.push(question) // Thêm câu hỏi vào mảng
  })

  // Tạo mới các câu hỏi trong cơ sở dữ liệu
  return await models.Question.bulkCreate(questionsData)
}

// Xác định loại câu hỏi
function getQuestionType (element) {
  let type = 'SINGLE_CHOICE'
  if (element.assessment_type === 'multi-select') {
    type = 'MULTIPLE_CHOICE' // Nếu câu hỏi là chọn nhiều, đặt loại là MULTIPLE_CHOICE
  }
  return type
}

// Lấy các tùy chọn trả lời cho câu hỏi
function getOptions (element) {
  let a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p
  // Lấy tùy chọn trả lời tương ứng với chỉ số
  if (getAnswerAt(element, 0) !== undefined) { a = getAnswerAt(element, 0) }
  if (getAnswerAt(element, 1) !== undefined) { b = getAnswerAt(element, 1) }
  if (getAnswerAt(element, 2) !== undefined) { c = getAnswerAt(element, 2) }
  if (getAnswerAt(element, 3) !== undefined) { d = getAnswerAt(element, 3) }
  if (getAnswerAt(element, 4) !== undefined) { e = getAnswerAt(element, 4) }
  if (getAnswerAt(element, 5) !== undefined) { f = getAnswerAt(element, 5) }
  if (getAnswerAt(element, 6) !== undefined) { g = getAnswerAt(element, 6) }
  if (getAnswerAt(element, 7) !== undefined) { h = getAnswerAt(element, 7) }
  if (getAnswerAt(element, 8) !== undefined) { i = getAnswerAt(element, 8) }
  if (getAnswerAt(element, 9) !== undefined) { j = getAnswerAt(element, 9) }
  if (getAnswerAt(element, 10) !== undefined) { k = getAnswerAt(element, 10) }
  if (getAnswerAt(element, 11) !== undefined) { l = getAnswerAt(element, 11) }
  if (getAnswerAt(element, 12) !== undefined) { m = getAnswerAt(element, 12) }
  if (getAnswerAt(element, 13) !== undefined) { n = getAnswerAt(element, 13) }
  if (getAnswerAt(element, 14) !== undefined) { o = getAnswerAt(element, 14) }
  if (getAnswerAt(element, 15) !== undefined) { p = getAnswerAt(element, 15) }
  return { a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p }
}

// Tạo mới kỳ thi trong cơ sở dữ liệu
async function createExam () {
  const exam = [{
    name: 'enter the new name here' // Tên kỳ thi mới
  }]
  return await models.Exam.bulkCreate(exam) // Tạo mới kỳ thi và trả về kết quả
}

// Liên kết giữa kỳ thi và các câu hỏi
async function linkExamQuestion (exam, questions) {
  const data = []
  questions.forEach((q) => {
    const examQuestion = {
      examId: exam[0].dataValues.id, // ID của kỳ thi
      questionId: q.id // ID của câu hỏi
    }
    data.push(examQuestion) // Thêm vào mảng dữ liệu
  })
  return await models.ExamQuestion.bulkCreate(data) // Lưu liên kết giữa kỳ thi và câu hỏi vào cơ sở dữ liệu
}

// Lấy tùy chọn trả lời theo chỉ số
function getAnswerAt (element, index) {
  return element.prompt.answers[index]
}

// Xóa các thẻ HTML khỏi chuỗi
function removeHTMLTag (string) {
  return string.replace(/<[^>]*>?/gm, '')
}

// Làm đẹp nội dung văn bản
function beautifyText (string) {
  string = string.replace(/\s*([,.!?:;]+)(?!\s*$)\s*/g, '$1 ')
  string = MSNotice(string)
  string = string.replace(/✑/g, '<br>✑')
  string = string.replace(/Solution:/g, '<br>Solution:')
  string = string.replace(/eact. js/g, 'eact.js')
  string = string.replace(/. NET/g, '.NET')
  string = string.replace(/Node. js/g, 'Node.js')
  string = string.replace(/. PNG/g, '.PNG')
  string = string.replace(/. jpg/g, '.jpg')
  string = string.replace('https: //img-c. udemycdn. com', 'https://img-c.udemycdn.com')
  return string
}

// Thêm thông báo của Microsoft vào nội dung câu hỏi
function MSNotice (string) {
  const notice = 'Note: This question is part of a series of questions that present the same scenario. Each question in the series contains a unique solution that might meet the stated goals. Some question sets might have more than one correct solution, while others might not have a correct solution. After you answer a question in this section, you will NOT be able to return to it. As a result, these questions will not appear in the review screen.'
  return string.replace(notice, notice + '<br><br>') // Thêm dấu ngắt dòng cho thông báo
}
