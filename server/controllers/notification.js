const express = require('express')
const { models } = require('../models')
const { isAuthenticated } = require('../middlewares/authentication')
const router = express.Router()

router.get('/getNotiByUserId', isAuthenticated, async (req, res) => {
  const userId = req.user.id
  const limit = parseInt(req.query.limit, 10) || 5
  const offset = parseInt(req.query.offset, 10) || 0

  try {
    const { rows } = await models.NotificationRecipient.findAndCountAll({
      where: { userId },
      include: [{
        model: models.Notification,
        as: 'Notification',
        required: true
      }],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    })
    const countUnread = await models.NotificationRecipient.count({ where: { userId, status: 0 } })
    res.json({ total: countUnread, notifications: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
})
// router.post('/createNotification', isAuthenticated, async (req, res) => {
//   const { title, message, url } = req.body.data
//   const userId = req.user.id
//   try {
//     console.log(title)
//     console.log(message)
//     const notification = await models.Notification.create({ title, message, url })

//     const recipients = {
//       notificationId: notification.id,
//       userId,
//       status: false
//     }
//     await models.NotificationRecipient.create(recipients)
//     const notificationWithRecipients = {
//       ...notification.toJSON(),
//       recipients
//     }

//     res.status(201).json(notificationWithRecipients)
//   } catch (err) {
//     console.error(err)
//     res.status(500).json({ message: 'Internal server error' })
//   }
// })
router.post('/createNotification', isAuthenticated, async (req, res) => {
  const { title, message, url } = req.body.data
  const userId = req.user.id
  try {
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
router.put('/readNotification', isAuthenticated, async (req, res) => {
  // const userId = req.user.id
  const recipientsId = req.body.data.recipientsId
  console.log(req.body.data)
  try {
    const notification = await models.NotificationRecipient.findByPk(recipientsId)
    console.log(notification)
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }
    await notification.update({ status: true })
    res.json(notification)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
})
router.put('/readAllNotification', isAuthenticated, async (req, res) => {
  const userId = req.user.id
  try {
    await models.NotificationRecipient.update({ status: true }, { where: { userId } })
    res.json({ message: 'All notifications have been read' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
})
router.delete('/removeNotification', isAuthenticated, async (req, res) => {
  const recipientsId = req.body.recipientsId
  try {
    const notification = await models.NotificationRecipient.findByPk(recipientsId)
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }
    await notification.destroy()
    res.json(notification)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
})
router.delete('/removeAllNotification', isAuthenticated, async (req, res) => {
  const userId = req.user.id
  try {
    await models.NotificationRecipient.destroy({ where: { userId } })
    res.json({ message: 'All notifications have been removed' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
})
router.put('/markAsUnread', isAuthenticated, async (req, res) => {
  const recipientsId = req.body.data.recipientsId
  try {
    const notification = await models.NotificationRecipient.findByPk(recipientsId)
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }
    await notification.update({ status: false })
    res.json(notification)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
})
router.put('/markAllAsUnread', isAuthenticated, async (req, res) => {
  const userId = req.user.id
  try {
    await models.NotificationRecipient.update({ status: false }, { where: { userId } })
    res.json({ message: 'All notifications have been marked as unread' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
})
module.exports = router
