const express = require('express')
const { models } = require('../models')
const { isAuthenticated } = require('../middlewares/authentication')
const router = express.Router()

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

module.exports = router
