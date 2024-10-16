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

router.post('/createStudyItemAndLession', isAuthenticated, async (req, res) => {
  try {
    const { lessionCategoryId, name, description, itemType, uploadedBy, type, locationPath } = req.body

    console.log('Request body:', req.body)

    if (!lessionCategoryId || !name || !itemType) {
      return res.status(400).json({ error: 'Missing required fields: lessionCategoryId, name, order, or itemType' })
    }

    if (lessionCategoryId === 0 || name.trim() === '' || itemType !== 'lession') {
      return res.status(400).json({
        error: 'Invalid input: lessionCategoryId, name, order must be valid, and itemType must be either "lession" or "exam".'
      })
    }

    const maxOrderItem = await models.StudyItem.findOne({
      where: { lessionCategoryId },
      order: [['order', 'DESC']]
    })
    const newOrder = maxOrderItem ? maxOrderItem.order + 1 : 1

    const newStudyItem = await models.StudyItem.create({
      lessionCategoryId,
      name,
      order: newOrder,
      description: description || null,
      itemType,
      status: 0
    })
    const newLession = await models.Lession.create({
      studyItemId: newStudyItem.id,
      type: type || null,
      locationPath: locationPath !== '' ? locationPath : null,
      uploadedBy: locationPath !== '' ? uploadedBy : null
    })

    logInfo(req, { newStudyItem, newLession })

    return res.status(201).json({ newStudyItem, newLession })
  } catch (error) {
    logError(req, error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/createStudyItemAndExam', isAuthenticated, async (req, res) => {
  try {
    const { lessionCategoryId, name, description, itemType, durationInMinute, pointToPass, numberOfAttempt, createrId } = req.body
    console.log('Request body:', req.body)

    if (!lessionCategoryId || !name || !itemType) {
      return res.status(400).json({ error: 'Missing required fields: lessionCategoryId, name, order, or itemType' })
    }

    if (lessionCategoryId === 0 || name.trim() === '' || itemType !== 'exam') {
      return res.status(400).json({
        error: 'Invalid input: lessionCategoryId, name must be valid, and itemType must be either "lession" or "exam".'
      })
    }

    const maxOrderItem = await models.StudyItem.findOne({
      where: { lessionCategoryId },
      order: [['order', 'DESC']]
    })
    const newOrder = maxOrderItem ? maxOrderItem.order + 1 : 1

    const newStudyItem = await models.StudyItem.create({
      lessionCategoryId,
      name,
      order: newOrder,
      description: description || null,
      itemType,
      status: 0
    })
    const newExam = await models.Exam.create({
      studyItemId: newStudyItem.id,
      durationInMinute: durationInMinute || 60,
      pointToPass: pointToPass || 0,
      numberOfAttempt: numberOfAttempt || 0,
      createrId
    })

    logInfo(req, { newStudyItem, newExam })

    return res.status(201).json({ newStudyItem, newExam })
  } catch (error) {
    logError(req, error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// Cập nhật thông tin của StudyItem và Lession
router.put('/editStudyItemAndLession/:studyItemId', isAuthenticated, async (req, res) => {
  try {
    const { studyItemId } = req.params
    const { name, description, type, locationPath, uploadedBy } = req.body

    console.log('Request body:', req.body)

    if (!name) {
      return res.status(400).json({ error: 'Missing required fields: lessionCategoryId, name, or itemType' })
    }

    const studyItem = await models.StudyItem.findByPk(studyItemId)
    if (!studyItem) {
      return res.status(404).json({ error: 'StudyItem not found' })
    }

    await studyItem.update({
      name,
      description
    })

    const lession = await models.Lession.findOne({ where: { studyItemId } })
    if (lession) {
      await lession.update({
        type: type !== '' ? type : null,
        locationPath: locationPath !== '' ? locationPath : null,
        uploadedBy: locationPath !== '' ? uploadedBy : null
      })
    }

    logInfo(req, { studyItem, lession })

    return res.status(200).json({ studyItem, lession })
  } catch (error) {
    logError(req, error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// Cập nhật thông tin của StudyItem và Exam
router.put('/editStudyItemAndExam/:studyItemId', isAuthenticated, async (req, res) => {
  try {
    const { studyItemId } = req.params
    const { name, description, durationInMinute, pointToPass, numberOfAttempt } = req.body

    console.log('Request body:', req.body)

    if (!name) {
      return res.status(400).json({ error: 'Missing required fields: lessionCategoryId, name, or itemType' })
    }

    const studyItem = await models.StudyItem.findByPk(studyItemId)
    if (!studyItem) {
      return res.status(404).json({ error: 'StudyItem not found' })
    }

    await studyItem.update({
      name,
      description
    })

    const exam = await models.Exam.findOne({ where: { studyItemId } })
    if (exam) {
      await exam.update({
        durationInMinute: durationInMinute || 60,
        pointToPass: pointToPass || 0,
        numberOfAttempt: numberOfAttempt || 0
      })
    }

    logInfo(req, { studyItem, exam })

    return res.status(200).json({ studyItem, exam })
  } catch (error) {
    logError(req, error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// Xóa StudyItem
router.delete('/deleteStudyItem/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params
  const t = await sequelize.transaction()

  try {
    const studyItem = await models.StudyItem.findByPk(id, { transaction: t })

    if (!studyItem) {
      await t.rollback()
      return res.status(404).json({ error: 'StudyItem not found' })
    }

    if (studyItem.itemType === 'lession') {
      await models.Lession.destroy({
        where: { studyItemId: studyItem.id },
        transaction: t
      })
    } else if (studyItem.itemType === 'exam') {
      await models.Exam.destroy({
        where: { studyItemId: studyItem.id },
        transaction: t
      })
    }

    await studyItem.destroy({ transaction: t })

    await t.commit()
    logInfo(req, { deletedStudyItemId: id })
    return res.status(200).json({ message: 'StudyItem and related data deleted successfully' })
  } catch (error) {
    await t.rollback()
    logError(req, error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
