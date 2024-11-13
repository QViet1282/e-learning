/* eslint-disable no-unused-vars */
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
    error,
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

router.get('/getRoles', isAuthenticated, async (req, res) => {
  try {
    const roles = await models.Role.findAll({
      attributes: ['id', 'name', 'description']
    })

    if (roles.length === 0) {
      return res.status(404).json({ message: 'No roles found' })
    }

    logInfo(req, roles)
    res.json(roles)
  } catch (error) {
    logError(req, error)
    res.status(500).json({ message: jsonError })
  }
})

module.exports = router
