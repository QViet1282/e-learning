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

// Edit category lession
router.put('/editCategoryLession/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params
    const { name, status } = req.body

    const categoryLession = await models.CategoryLession.findByPk(id)

    if (!categoryLession) {
      return res.status(404).json({ error: 'CategoryLession not found' })
    }

    await categoryLession.update({
      name: name || categoryLession.name,
      status: status || categoryLession.status
    })

    logInfo(req, categoryLession)

    return res.status(200).json(categoryLession)
  } catch (error) {
    logError(req, error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

router.delete('/deleteCategoryLession/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params

  try {
    const categoryLession = await models.CategoryLession.findByPk(id)

    if (!categoryLession) {
      return res.status(404).json({ error: 'CategoryLession not found' })
    }

    await categoryLession.destroy()

    logInfo(req, { deletedCategoryLessionId: id })

    return res.status(200).json({ message: 'CategoryLession deleted successfully' })
  } catch (error) {
    logError(req, error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
