const express = require('express')
const { models } = require('../models')
const { isAuthenticated } = require('../middlewares/authentication')
const router = express.Router()
const { Op } = require('sequelize')

router.post('/createNotification', isAuthenticated, async (req, res) => {
  const { title, message, url } = req.body.data
  const userId = req.user.id
  try {
    console.log('canh')
    console.log(title)
    console.log(message)
    const notification = await models.Notification.create({ title, message, url })

    const recipient = await models.NotificationRecipient.create({
      notificationId: notification.id,
      userId,
      status: false
    })

    const notificationWithRecipients = {
      ...notification.toJSON(),
      recipients: {
        ...recipient.toJSON(),
        recipientId: recipient.id
      }
    }

    res.status(201).json(notificationWithRecipients)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

router.post('/createAndReplicateNotification', isAuthenticated, async (req, res) => {
  const { title, message, url } = req.body.data

  try {
    const users = await models.User.findAll({ attributes: ['id'] })
    const userIds = users.map((user) => user.id)

    const notification = await models.Notification.create({ title, message, url: url !== '' ? url : null })

    const recipients = userIds.map((userId) => ({
      notificationId: notification.id,
      userId,
      status: 0
    }))

    await models.NotificationRecipient.bulkCreate(recipients)

    const notificationWithRecipients = {
      ...notification.toJSON(),
      recipients
    }

    res.status(201).json(notificationWithRecipients)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

router.get('/getAllNotification', isAuthenticated, async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query

  try {
    const offset = (page - 1) * limit

    const whereClause = {
      isDeleted: false,
      ...(search && {
        [Op.or]: [
          { title: { [Op.like]: `%${search}%` } },
          { message: { [Op.like]: `%${search}%` } }
        ]
      })
    }

    const { count, rows: notifications } = await models.Notification.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    })

    res.status(200).json({
      data: notifications,
      meta: {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

router.get('/getAllDeletedNotification', isAuthenticated, async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query

  try {
    const offset = (page - 1) * limit

    const whereClause = {
      isDeleted: true,
      ...(search && {
        [Op.or]: [
          { title: { [Op.like]: `%${search}%` } },
          { message: { [Op.like]: `%${search}%` } }
        ]
      })
    }

    const { count, rows: notifications } = await models.Notification.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    })

    res.status(200).json({
      data: notifications,
      meta: {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

router.put('/edit/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params
  const { title, message, url, isDeleted } = req.body
  console.log(title, message, url, isDeleted)

  try {
    const notification = await models.Notification.findByPk(id)

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    if (title !== undefined) notification.title = title
    if (message !== undefined) notification.message = message
    if (url !== undefined) notification.url = url
    if (isDeleted !== undefined) notification.isDeleted = isDeleted

    await notification.save()

    return res.status(200).json({ message: 'Notification updated successfully', notification })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

// router.get('/recipients', isAuthenticated, async (req, res) => {
//   try {
//     const recipients = await models.NotificationRecipient.findAll({
//       include: [
//         {
//           model: models.User,
//           attributes: ['id', 'firstName', 'lastName', 'email', 'username']
//         },
//         {
//           model: models.Notification,
//           attributes: ['id', 'title', 'message', 'url']
//         }
//       ],
//       order: [['createdAt', 'DESC']]
//     })

//     res.status(200).json(recipients)
//   } catch (err) {
//     console.error(err)
//     res.status(500).json({ message: 'Internal server error' })
//   }
// })

module.exports = router
