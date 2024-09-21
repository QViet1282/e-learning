const express = require('express')
const { models } = require('../models')
const { isAuthenticated } = require('../middlewares/authentication')
const jsonError = 'Internal server error'
const router = express.Router()
const { infoLogger, errorLogger } = require('../logs/logger')

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

router.get('/getEnrollmentByCourseId/:courseId', isAuthenticated, async (req, res) => {
  const loginedUserId = req.user.id
  const courseIdData = req.params.courseId
  try {
    console.log('courseId', courseIdData)
    const enrollment = await models.Enrollment.findOne({ where: { courseId: courseIdData, userId: loginedUserId } })
    logInfo(req, enrollment)
    res.json(enrollment)
  } catch (err) {
    logError(req, err)
    res.status(500).json({ message: jsonError })
  }
})

module.exports = router
