/* eslint-disable no-unused-vars */
const express = require('express')
const { models } = require('../models')
const { isAuthenticated } = require('../middlewares/authentication')
const jsonError = 'Internal server error'
const router = express.Router()
const { infoLogger, errorLogger } = require('../logs/logger')
const { sequelize } = require('../models')
const { Op } = require('sequelize')

// Hàm log lỗi
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

// Hàm log thông tin
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

// Lấy danh sách yêu cầu rút tiền
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query

    const pageNumber = parseInt(page, 10) || 1
    const limitNumber = parseInt(limit, 10) || 10
    const offset = (pageNumber - 1) * limitNumber

    const where = {}
    if (status) {
      where.status = status
    }
    if (search) {
      where[Op.or] = [
        {
          cardNumber: {
            [Op.like]: `%${search}%`
          }
        },
        {
          id: {
            [Op.like]: `%${search}%`
          }
        }
      ]
    }

    const { rows: payoutRequests, count: totalItems } = await models.PayoutRequest.findAndCountAll({
      where,
      limit: limitNumber,
      offset,
      order: [['createdAt', 'ASC']]
    })

    res.json({
      data: payoutRequests,
      meta: {
        currentPage: pageNumber,
        totalItems,
        totalPages: Math.ceil(totalItems / limitNumber),
        itemsPerPage: limitNumber
      }
    })
  } catch (error) {
    res.status(500).json({ message: jsonError })
  }
})

// API lấy lịch sử rút tiền
router.get('/requestPayoutHistory', isAuthenticated, async (req, res) => {
  try {
    const payoutHistory = await models.PayoutRequest.findAll({
      where: {
        instructorId: req.user.id
      },
      order: [['createdAt', 'DESC']]
    })

    if (!payoutHistory || payoutHistory.length === 0) {
      return res.status(404).json({ message: 'Không có lịch sử rút tiền' })
    }

    logInfo(req, payoutHistory)
    res.json(payoutHistory)
  } catch (error) {
    res.status(500).json({ message: jsonError })
  }
})

// Tạo yêu cầu rút tiền mới
router.post('/requestPayout', isAuthenticated, async (req, res) => {
  try {
    const id = req.user.id
    const { totalRevenue, serviceFee, payoutAmount, bankName, cardholderName, cardNumber } = req.body.data

    if (!totalRevenue || !serviceFee || !payoutAmount || !bankName || !cardholderName || !cardNumber) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const existingRequest = await models.PayoutRequest.findOne({
      where: {
        instructorId: id,
        status: 'Pending'
      }
    })

    if (existingRequest) {
      return res.status(409).json({ message: 'You already have a pending payout request' })
    }

    const newPayoutRequest = await models.PayoutRequest.create({
      instructorId: id,
      totalRevenue,
      serviceFee,
      payoutAmount,
      bankName,
      cardholderName,
      cardNumber,
      status: 'Pending'
    })

    res.status(201).json(newPayoutRequest)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.get('/statistics', isAuthenticated, async (req, res) => {
  try {
    // Truy vấn tổng doanh thu
    const totalRevenueResult = await models.Enrollment.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('Course.price')), 'totalRevenue']
      ],
      include: [
        {
          model: models.Course,
          attributes: []
        }
      ],
      where: { status: 1 }
    })
    const totalRevenue = totalRevenueResult?.get('totalRevenue') || 0

    // Truy vấn tổng số tiền chưa chi trả
    const pendingRevenueResult = await models.User.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('pendingRevenue')), 'totalPending']
      ]
    })
    const totalPending = (pendingRevenueResult?.get('totalPending') || 0) * 0.7

    // Truy vấn tổng số tiền đã chi trả
    const totalPaidResult = await models.PayoutRequest.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('payoutAmount')), 'totalPaid']
      ],
      where: {
        status: 'Success'
      }
    })
    const totalPaid = totalPaidResult?.get('totalPaid') || 0

    // Tính toán doanh thu hệ thống
    const systemBudget = totalRevenue * 0.3

    const statisticsData = {
      totalRevenue: Number(totalRevenue) ?? 0,
      systemBudget: systemBudget ?? 0,
      totalPending: totalPending ?? 0,
      totalPaid: Number(totalPaid) ?? 0
    }

    res.status(201).json(statisticsData)
  } catch (error) {
    console.error('Error calculating statistics:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

router.put('/processPayment/:id', isAuthenticated, async (req, res) => {
  try {
    const adminRole = req.user.GroupWithRoles.description
    if (adminRole !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' })
    }

    const payoutRequestId = req.params.id
    const { result, note, payoutDate } = req.body

    if (result == null) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const payoutRequest = await models.PayoutRequest.findByPk(payoutRequestId)
    if (!payoutRequest) {
      return res.status(404).json({ message: 'Payout request not found' })
    }

    const user = await models.User.findByPk(payoutRequest.instructorId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (result === true) {
      if (user.pendingRevenue < payoutRequest.totalRevenue) {
        return res.status(400).json({ message: 'Insufficient pending revenue' })
      }

      user.pendingRevenue -= payoutRequest.totalRevenue
      await user.save()

      payoutRequest.status = 'Success'
      payoutRequest.note = note || ''
      payoutRequest.payoutDate = payoutDate || null
      await payoutRequest.save()

      return res.status(200).json(payoutRequest)
    }

    payoutRequest.status = 'Fail'
    payoutRequest.note = note || ''
    await payoutRequest.save()

    res.status(200).json(payoutRequest)
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
})

module.exports = router
