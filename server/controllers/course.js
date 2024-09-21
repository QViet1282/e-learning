const express = require('express')
const { models } = require('../models')
const { isAuthenticated } = require('../middlewares/authentication')
const jsonError = 'Internal server error'
const router = express.Router()
const { infoLogger, errorLogger } = require('../logs/logger')
const { INTEGER } = require('sequelize')

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

/*****************************
 * ROUTES FOR COURSE
 *****************************/

router.get('/getAllCourse', isAuthenticated, async (req, res) => {
  try {
    const courses = await models.Course.findAll()
    logInfo(req, courses)
    res.status(200).json(courses)
  } catch (error) {
    logError(req, error)
    res.status(500).json({ error: jsonError })
  }
})

router.post('/addNewCourse', isAuthenticated, async (req, res) => {
  try {
    const {
      categoryCourseId,
      name,
      summary,
      assignedBy,
      durationInMinute,
      startDate,
      endDate,
      description,
      locationPath,
      prepare,
      price,
      status
    } = req.body.data

    if (!name || !summary || !assignedBy) {
      return res.status(400).json({ error: 'Required fields are missing' })
    }

    const newCourse = await models.Course.create({
      categoryCourseId,
      name,
      summary,
      assignedBy,
      durationInMinute,
      startDate,
      endDate,
      description,
      locationPath,
      prepare,
      price,
      status
    })
    logInfo(req, newCourse)
    res.status(201).json(newCourse)
  } catch (error) {
    logError(req, error)
    res.status(500).json({ error: jsonError })
  }
})

/*****************************
 * ROUTES FOR CATEGORY LESSONS
 *****************************/
router.get('/getCategoryLessionByCourse/:courseId', isAuthenticated, async (req, res) => {
  try {
    const { courseId } = req.params
    const categories = await models.CategoryLession.findAll({
      where: { courseId },
      order: [['order', 'ASC']]
    })

    if (categories.length === 0) {
      return res.status(404).json({ error: 'No lessons found for this course' })
    }

    logInfo(req, categories)
    res.status(200).json(categories)
  } catch (error) {
    logError(req, error)
    res.status(500).json({ error: jsonError })
  }
})

router.post('/createCategoryLession', isAuthenticated, async (req, res) => {
  try {
    const { courseId, name, order, status } = req.body
    console.log('Request body:', req.body)

    if (!courseId || !name || typeof order === 'undefined') {
      return res.status(400).json({ error: 'Missing required fields: courseId, name, or order' })
    }

    const newCategoryLession = await models.CategoryLession.create({
      courseId,
      name,
      order,
      status: typeof status !== 'undefined' ? status : 0
    })

    logInfo(req, newCategoryLession)

    return res.status(201).json(newCategoryLession)
  } catch (error) {
    logError(req, error)
    return res.status(500).json({ error: jsonError })
  }
})

router.post('/updateCategoryLession', isAuthenticated, async (req, res) => {
  try {
    const { categoryLession } = req.body

    if (!categoryLession || !categoryLession.id) {
      return res.status(400).json({ error: 'CategoryLession data or ID is missing' })
    }

    const [updated] = await models.CategoryLession.update(categoryLession, {
      where: { id: categoryLession.id }
    })

    if (updated === 0) {
      return res.status(404).json({ error: 'CategoryLession not found' })
    }

    logInfo(req, categoryLession)
    res.status(200).json(categoryLession)
  } catch (error) {
    logError(req, error)
    res.status(500).json({ error: jsonError })
  }
})

router.post('/updateCategoryLessions', isAuthenticated, async (req, res) => {
  try {
    const { categoryLessions } = req.body

    if (!Array.isArray(categoryLessions) || categoryLessions.length === 0) {
      return res.status(400).json({ error: 'No CategoryLessions data provided' })
    }

    const updatePromises = categoryLessions.map(categoryLession =>
      models.CategoryLession.update(categoryLession, { where: { id: categoryLession.id } })
    )

    const results = await Promise.all(updatePromises)
    const allUpdated = results.every(result => result[0] > 0)

    if (!allUpdated) {
      return res.status(404).json({ error: 'Some CategoryLessions not found' })
    }

    logInfo(req, categoryLessions)
    res.status(200).json(categoryLessions)
  } catch (error) {
    logError(req, error)
    res.status(500).json({ error: jsonError })
  }
})

/*****************************
 * ROUTES FOR LESSION
 *****************************/

router.get('/getLessionByCategory/:lessionCategoryId', isAuthenticated, async (req, res) => {
  try {
    const { lessionCategoryId } = req.params
    const lessons = await models.Lession.findAll({ where: { lessionCategoryId } })

    if (lessons.length === 0) {
      return res.status(404).json({ error: 'No lessons found for this category' })
    }

    logInfo(req, lessons)
    res.status(200).json(lessons)
  } catch (error) {
    logError(req, error)
    res.status(500).json({ error: 'An error occurred while fetching lessons' })
  }
})

module.exports = router
