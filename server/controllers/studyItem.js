/* eslint-disable no-unused-vars */
const express = require('express')
const { models } = require('../models')
const { sequelize } = require('../models')
const { QueryTypes } = require('sequelize')
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
  const transaction = await sequelize.transaction() // Khởi tạo transaction

  try {
    const {
      lessionCategoryId,
      name,
      description,
      itemType,
      uploadedBy,
      type,
      locationPath,
      durationInSecond
    } = req.body

    console.log('Request body:', req.body)

    if (!lessionCategoryId || !name || !itemType) {
      return res.status(400).json({ error: 'Missing required fields: lessionCategoryId, name, or itemType' })
    }

    if (lessionCategoryId === 0 || name.trim() === '' || itemType !== 'lession') {
      return res.status(400).json({
        error: 'Invalid input: lessionCategoryId, name must be valid, and itemType must be "lession" or "exam".'
      })
    }

    const maxOrderItem = await models.StudyItem.findOne({
      where: { lessionCategoryId },
      order: [['order', 'DESC']],
      transaction
    })

    const newOrder = maxOrderItem ? maxOrderItem.order + 1 : 1

    const newStudyItem = await models.StudyItem.create({
      lessionCategoryId,
      name,
      order: newOrder,
      description: description || null,
      itemType,
      status: 0
    }, { transaction })

    const newLession = await models.Lession.create({
      studyItemId: newStudyItem.id,
      type: type || null,
      locationPath: locationPath !== '' ? locationPath : null,
      uploadedBy: locationPath !== '' ? uploadedBy : null,
      durationInSecond
    }, { transaction })

    logInfo(req, { newStudyItem, newLession })
    await transaction.commit()

    return res.status(201).json({ newStudyItem, newLession })
  } catch (error) {
    await transaction.rollback()
    logError(req, error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/createStudyItemAndExam', isAuthenticated, async (req, res) => {
  const transaction = await sequelize.transaction() // Khởi tạo transaction

  try {
    const {
      lessionCategoryId,
      name,
      description,
      itemType,
      durationInMinute,
      pointToPass,
      numberOfAttempt,
      createrId
    } = req.body

    console.log('Request body:', req.body)

    if (!lessionCategoryId || !name || !itemType) {
      return res.status(400).json({
        error: 'Missing required fields: lessionCategoryId, name, or itemType'
      })
    }

    if (lessionCategoryId === 0 || name.trim() === '' || itemType !== 'exam') {
      return res.status(400).json({
        error: 'Invalid input: lessionCategoryId, name must be valid, and itemType must be "exam".'
      })
    }

    const maxOrderItem = await models.StudyItem.findOne({
      where: { lessionCategoryId },
      order: [['order', 'DESC']],
      transaction
    })

    const newOrder = maxOrderItem ? maxOrderItem.order + 1 : 1

    const newStudyItem = await models.StudyItem.create({
      lessionCategoryId,
      name,
      order: newOrder,
      description: description || null,
      itemType,
      status: 0
    }, { transaction })

    const newExam = await models.Exam.create({
      studyItemId: newStudyItem.id,
      durationInMinute: durationInMinute || 60,
      pointToPass: pointToPass || 0,
      numberOfAttempt: numberOfAttempt || 0,
      createrId
    }, { transaction })

    logInfo(req, { newStudyItem, newExam })
    await transaction.commit()

    return res.status(201).json({ newStudyItem, newExam })
  } catch (error) {
    await transaction.rollback()
    logError(req, error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// Cập nhật thông tin của StudyItem và Lession
router.put('/editStudyItemAndLession/:studyItemId', isAuthenticated, async (req, res) => {
  try {
    const { studyItemId } = req.params
    const { name, description, type, locationPath, uploadedBy, durationInSecond } = req.body

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
        uploadedBy: locationPath !== '' ? uploadedBy : null,
        durationInSecond: durationInSecond ?? null
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

    await models.StudyItem.decrement('order', {
      by: 1,
      where: {
        order: { [Op.gt]: studyItem.order }, // Giảm thứ tự cho các item sau nó
        lessionCategoryId: studyItem.lessionCategoryId
      },
      transaction: t
    })

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

router.get('/user-answer-history/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params
    const { page = 1, limit = 10, search = '' } = req.query

    const examIds = await getExamIdsByCourseId(courseId)

    if (!examIds || examIds.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bài thi cho khóa học này.' })
    }

    const examIdList = examIds

    const offset = (page - 1) * limit

    const searchTerms = search.split(' ').filter(term => term.trim() !== '')

    const searchConditions = searchTerms.length > 0
      ? `AND (${searchTerms.map((term, index) => `
          e.name LIKE :search${index} OR 
          CAST(uah.attempt AS CHAR) LIKE :search${index} OR 
          CAST(uah.overAllScore AS CHAR) LIKE :search${index} OR 
          u.firstName LIKE :search${index} OR 
          u.lastName LIKE :search${index}
        `).join(' OR ')})`
      : ''

    const groupedData = await sequelize.query(
      `
      SELECT 
        uah.examId, 
        e.name AS examName, 
        uah.attempt, 
        uah.overAllScore, 
        u.id AS userId, 
        u.firstName, 
        u.lastName, 
        COUNT(uah.questionId) AS questionCount,
        COUNT(*) OVER() AS totalCount
      FROM users_answer_history uah
      JOIN users u ON u.id = uah.userId
      JOIN study_items e ON e.id = uah.examId 
      WHERE uah.examId IN (:examIdList)
      ${searchConditions}
      GROUP BY 
        uah.examId, 
        e.name, 
        uah.attempt, 
        uah.overAllScore, 
        u.id, 
        u.firstName, 
        u.lastName
      LIMIT :limit OFFSET :offset
      `,
      {
        replacements: {
          examIdList,
          limit: parseInt(limit),
          offset: parseInt(offset),
          ...searchTerms.reduce((acc, term, index) => {
            acc[`search${index}`] = `%${term}%`
            return acc
          }, {})
        },
        type: QueryTypes.SELECT
      }
    )

    const totalCount = groupedData.length > 0 ? groupedData[0].totalCount : 0
    const totalPages = Math.ceil(totalCount / limit)

    const result = groupedData.map((item) => ({
      examName: item.examName,
      attempt: item.attempt,
      overAllScore: item.overAllScore,
      userName: `${item.firstName} ${item.lastName}`,
      countQuestion: item.questionCount
    }))

    res.json({
      totalPages,
      currentPage: page,
      totalItems: totalCount,
      items: result
    })
  } catch (error) {
    console.error('Error fetching grouped data:', error)
    res.status(500).json({ message: 'Có lỗi xảy ra khi lấy dữ liệu', error: error.message })
  }
})

const getExamIdsByCourseId = async (courseId) => {
  try {
    const examIds = await models.Exam.findAll({
      attributes: [
        'studyItemId',
        [sequelize.fn('COUNT', sequelize.col('studyItemId')), 'examCount']
      ],
      where: {
        studyItemId: {
          [Op.in]: sequelize.literal(`(
            SELECT e.studyItemId
            FROM category_lession cl
            JOIN study_items si ON si.lessionCategoryId = cl.id
            JOIN exams e ON e.studyItemId = si.id
            WHERE cl.courseId = ${courseId}
          )`)
        }
      },
      group: ['studyItemId']
    })

    const examIdList = examIds.map(exam => exam.studyItemId)
    return examIdList
  } catch (error) {
    console.error('Error fetching exam IDs:', error)
    throw error
  }
}

module.exports = router
