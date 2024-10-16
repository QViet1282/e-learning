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

router.get('/getAllCategoryCourse', isAuthenticated, async (req, res) => {
  try {
    const categoriesCourse = await models.CategoryCourse.findAll()
    logInfo(req, categoriesCourse)
    res.status(200).json(categoriesCourse)
  } catch (err) {
    logError(req, err)
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

module.exports = router
