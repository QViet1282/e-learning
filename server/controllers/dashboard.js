const express = require('express')
const { models } = require('../models')
const { isAuthenticated } = require('../middlewares/authentication')
const router = express.Router()

// Lấy tất cả câu hỏi, kỳ thi và mối quan hệ giữa câu hỏi và kỳ thi
router.get('/', isAuthenticated, async (_, res) => {
  try {
    const questions = await models.Question.findAll() // Lấy tất cả câu hỏi từ bảng Question
    const exams = await models.Exam.findAll() // Lấy tất cả kỳ thi từ bảng Exam
    const examsQuestions = await models.ExamQuestion.findAll() // Lấy tất cả mối quan hệ giữa câu hỏi và kỳ thi từ bảng ExamQuestion

    res.json({ questions, exams, examsQuestions }) // Trả về danh sách câu hỏi, kỳ thi và mối quan hệ giữa chúng
  } catch (error) {
    res.json(error) // Trả về lỗi nếu có
  }
})

// Tạo mối quan hệ giữa kỳ thi và câu hỏi
router.post('/create', isAuthenticated, async (req, res) => {
  try {
    // Xóa tất cả mối quan hệ cũ giữa kỳ thi và câu hỏi của kỳ thi được chỉ định
    await models.ExamQuestion.destroy({
      where: {
        examId: req.body.data.examId // Điều kiện: Mối quan hệ liên quan đến kỳ thi có ID là examId
      }
    })

    // Tạo mảng dữ liệu mới từ các ID câu hỏi nhận được từ request
    const data = req.body.data.questionIds?.map((questionId) => ({
      examId: req.body.data.examId, // Gán ID kỳ thi cho từng câu hỏi
      questionId // ID của câu hỏi
    }))

    // Tạo mới các mối quan hệ giữa kỳ thi và câu hỏi
    const response = await models.ExamQuestion.bulkCreate(data) // Lưu vào bảng ExamQuestion
    res.json(response) // Trả về phản hồi dưới dạng JSON với các mối quan hệ vừa được tạo
  } catch (error) {
    res.json(error) // Trả về lỗi nếu có
  }
})

module.exports = router
