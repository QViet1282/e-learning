/* eslint-disable no-unused-vars */
const express = require('express')
const { models } = require('../models')
const { sequelize } = require('../models')
const { isAuthenticated } = require('../middlewares/authentication')
const jsonError = 'Internal server error'
const router = express.Router()
const { infoLogger, errorLogger } = require('../logs/logger')
// const { INTEGER } = require('sequelize')
const { Op } = require('sequelize')

function logError (req, error) {
  const request = req.body.data ? req.body.data : (req.params ? req.params : req.query)
  errorLogger.error({
    message: `Error ${req.path}`,
    method: req.method,
    endpoint: req.path,
    request,
    error: error.message,
    user: req.user.id
  })
}

function logInfo (req, response) {
  const request = req.body.data ? req.body.data : (req.params ? req.params : req.query)
  infoLogger.info({
    message: `Accessed ${req.path}`,
    method: req.method,
    endpoint: req.path,
    request,
    response,
    user: req.user.id
  })
}

router.get('/getAllQuestionByExamId/:examId', isAuthenticated, async (req, res) => {
  try {
    const { examId } = req.params

    if (!examId) {
      return res.status(400).json({ message: 'examId is required' })
    }

    const questions = await models.Question.findAll({
      where: { examId },
      order: [['order', 'ASC']]
    })

    logInfo(req, questions)
    res.json(questions)
  } catch (err) {
    logError(req, err)
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

router.post('/createQuestion', isAuthenticated, async (req, res) => {
  try {
    const { examId, instruction, content, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, answer, explanation } = req.body

    if (!examId || !content || !answer) {
      return res.status(400).json({ message: 'Các trường bắt buộc examId, content, answer là bắt buộc' })
    }
    const isMultipleChoice = answer.includes('::')
    const type = isMultipleChoice ? 'MULTIPLE_CHOICE' : 'SINGLE_CHOICE'
    const maxOrderItem = await models.Question.findOne({
      where: { examId },
      order: [['order', 'DESC']]
    })
    const newOrder = maxOrderItem ? maxOrderItem.order + 1 : 1
    const newQuestion = await models.Question.create(
      {
        examId,
        instruction,
        content,
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
        p,
        answer,
        explanation,
        type,
        isQuestionStopped: false,
        order: newOrder
      }
    )

    logInfo(req, newQuestion)
    return res.status(201).json(newQuestion)
  } catch (err) {
    logError(req, err)
    console.error(err)
    return res.status(500).json({ message: jsonError })
  }
})

router.put('/editQuestion/:questionId', isAuthenticated, async (req, res) => {
  try {
    const { questionId } = req.params
    const { instruction, content, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, answer, explanation } = req.body

    if (!content || !answer) {
      return res.status(400).json({ message: 'Các trường bắt buộc content, answer là bắt buộc' })
    }

    const question = await models.Question.findByPk(questionId)

    if (!question) {
      return res.status(404).json({ message: 'Câu hỏi không tồn tại' })
    }

    const isMultipleChoice = answer.includes('::')
    const type = isMultipleChoice ? 'MULTIPLE_CHOICE' : 'SINGLE_CHOICE'

    await question.update({
      instruction,
      content,
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
      p,
      answer,
      explanation,
      type
    })

    logInfo(req, question)
    return res.status(200).json(question)
  } catch (err) {
    logError(req, err)
    console.error(err)
    return res.status(500).json({ message: 'Có lỗi xảy ra khi cập nhật câu hỏi' })
  }
})

router.delete('/deleteQuestion/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params

  try {
    const question = await models.Question.findByPk(id)

    if (!question) {
      return res.status(404).json({ error: 'Question not found' })
    }

    await question.destroy()

    logInfo(req, { deletedQuestionId: id })

    return res.status(200).json({ message: 'Question deleted successfully' })
  } catch (error) {
    logError(req, error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

router.put('/updateQuestionOrder', isAuthenticated, async (req, res) => {
  const oldOrder = Number(req.body.oldOrder)
  const newOrder = Number(req.body.newOrder)
  const questionId = Number(req.body.questionId)
  const examId = Number(req.body.examId)
  const updatedAt = req.body.updatedAt

  console.log(questionId, oldOrder, newOrder, examId)
  if (questionId == null || oldOrder == null || newOrder == null || examId == null | updatedAt == null) {
    return res.status(400).json({ error: 'Missing or null input' })
  }

  const transaction = await sequelize.transaction()
  const question = await models.Question.findOne({
    where: { id: questionId, examId }
  })

  if (!question) {
    return res.status(404).json({ error: 'Study item not found' })
  }

  if (question.updatedAt.getTime() !== new Date(updatedAt).getTime()) {
    return res.status(409).json({ error: 'Conflict: The item has been modified by another user.' })
  }
  try {
    // Nếu newOrder nhỏ hơn oldOrder => Các mục giữa oldOrder và newOrder sẽ được tăng lên 1
    if (newOrder < oldOrder) {
      await models.Question.increment('order', {
        by: 1,
        where: {
          order: { [Op.between]: [newOrder, oldOrder - 1] },
          examId
        },
        transaction
      })
    } else if (newOrder > oldOrder) {
      // Nếu newOrder lớn hơn oldOrder => Các mục giữa oldOrder và newOrder sẽ được giảm đi 1
      await models.Question.decrement('order', {
        by: 1,
        where: {
          order: { [Op.between]: [oldOrder + 1, newOrder] },
          examId
        },
        transaction
      })
    }

    await models.Question.update(
      { order: newOrder },
      {
        where: { id: questionId },
        transaction
      }
    )

    await transaction.commit()
    res.status(200).json({ message: 'question order updated successfully' })
  } catch (error) {
    await transaction.rollback()
    logError(req, error)
    res.status(500).json({ error: 'An error occurred while updating question order' })
  }
})

module.exports = router
