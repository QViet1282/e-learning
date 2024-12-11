/* eslint-disable camelcase */
const { fakerEN: faker } = require('@faker-js/faker')
const AlertRecipientsList = require('../models/alert_recipients_list')
const User = require('../models/user')
const Notification = require('../models/notification')

const generateUserId = async () => {
  const users = await User.findAll()
  const userIds = users.map(user => user.id)
  const randomIndex = Math.floor(Math.random() * userIds.length)
  const randomUserId = userIds[randomIndex]
  return randomUserId
}

const generateNotificationId = async () => {
  const notifications = await Notification.findAll()
  const notiIds = notifications.map(noti => noti.id)
  const randomIndex = Math.floor(Math.random() * notiIds.length)
  const randomNotiId = notiIds[randomIndex]
  return randomNotiId
}

const generateNotificationRecipient = async () => {
  const usedPairs = new Set()
  const notifications = []

  while (notifications.length < 10) {
    const userId = await generateUserId()
    const notificationId = await generateNotificationId()
    const pair = `${userId}-${notificationId}`

    if (!usedPairs.has(pair)) {
      usedPairs.add(pair)
      notifications.push({
        userId,
        notificationId,
        status: false,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      })
    }
  }
  return notifications
}

const seedNotificationRecipient = async () => {
  try {
    const count = await AlertRecipientsList.count()
    if (count === 0) {
      const alert_recipients_list = await generateNotificationRecipient()
      await AlertRecipientsList.bulkCreate(alert_recipients_list, { validate: true })
    } else {
      console.log('AlertRecipientsList table is not empty.')
    }
  } catch (error) {
    console.log(`Failed to seed AlertRecipientsList data: ${error}`)
  }
}

module.exports = seedNotificationRecipient
