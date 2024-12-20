const express = require('express')
const { models } = require('../models')
const { isAuthenticated } = require('../middlewares/authentication')
const router = express.Router()
const { Op } = require('sequelize')
const moment = require('moment-timezone')

router.get('/getNotiByUserId', isAuthenticated, async (req, res) => {
  const userId = req.user.id
  const limit = parseInt(req.query.limit, 10) || 5
  const offset = parseInt(req.query.offset, 10) || 0

  // Lấy thời gian hiện tại (theo múi giờ Việt Nam)
  const now = moment().tz('Asia/Ho_Chi_Minh').toDate()

  try {
    // Lấy danh sách thông báo với điều kiện notifyAt <= now
    const notificationsData = await models.AlertRecipientsList.findAndCountAll({
      where: { userId },
      include: [{
        model: models.Notification,
        as: 'Notification',
        required: true,
        where: { notifyAt: { [Op.lte]: now } } // Điều kiện notifyAt <= now
      }],
      limit,
      offset,
      order: [[{ model: models.Notification, as: 'Notification' }, 'notifyAt', 'DESC']] // Sắp xếp theo notifyAt giảm dần
    })

    // Biến đổi kết quả để trích xuất notifyAt
    const notifications = notificationsData.rows.map(notification => {
      return {
        ...notification.get(), // Lấy tất cả các thuộc tính từ AlertRecipientsList
        notifyAt: notification.Notification.notifyAt // Lấy notifyAt từ bảng Notification
      }
    })

    // Đếm số thông báo chưa đọc (status = 0)
    const countUnread = await models.AlertRecipientsList.count({
      where: { userId, status: 0 },
      include: [{
        model: models.Notification,
        as: 'Notification',
        required: true,
        where: { notifyAt: { [Op.lte]: now } } // Điều kiện notifyAt <= now
      }]
    })

    // Trả về kết quả với notifyAt được xử lý và sắp xếp
    res.json({
      total: countUnread, // Tổng số thông báo chưa đọc
      notifications // Danh sách thông báo kèm notifyAt
    })
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
//     await models.AlertRecipientsList.create(recipients)
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

    const recipient = await models.AlertRecipientsList.create({
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
    const notification = await models.AlertRecipientsList.findByPk(recipientsId)
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
    await models.AlertRecipientsList.update({ status: true }, { where: { userId } })
    res.json({ message: 'All notifications have been read' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
})
router.delete('/removeNotification', isAuthenticated, async (req, res) => {
  const recipientsId = req.body.recipientsId
  try {
    const notification = await models.AlertRecipientsList.findByPk(recipientsId)
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
    await models.AlertRecipientsList.destroy({ where: { userId } })
    res.json({ message: 'All notifications have been removed' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
})
router.put('/markAsUnread', isAuthenticated, async (req, res) => {
  const recipientsId = req.body.data.recipientsId
  try {
    const notification = await models.AlertRecipientsList.findByPk(recipientsId)
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
    await models.AlertRecipientsList.update({ status: false }, { where: { userId } })
    res.json({ message: 'All notifications have been marked as unread' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

router.post('/createAndReplicateNotification', isAuthenticated, async (req, res) => {
  const { title, message, url, notifyAt, courseId } = req.body.data

  try {
    let userIds

    if (courseId) {
      const enrolledUsers = await models.Enrollment.findAll({
        where: { courseId },
        include: [
          {
            model: models.Order,
            attributes: ['userId']
          }
        ]
      })

      userIds = enrolledUsers.map((enrollment) => enrollment.Order.userId)
    } else {
      const users = await models.User.findAll({ attributes: ['id'] })
      userIds = users.map((user) => user.id)
    }

    const notification = await models.Notification.create({
      title,
      message,
      url: url !== '' ? url : null,
      notifyAt: notifyAt ? new Date(notifyAt) : Date.now(),
      courseId: courseId ?? null
    })

    console.log('User IDs:', userIds)

    const recipients = userIds.map((userId) => ({
      notificationId: notification.id,
      userId,
      status: 0
    }))

    await models.AlertRecipientsList.bulkCreate(recipients)

    const notificationWithRecipients = {
      ...notification.toJSON(),
      recipients
    }

    res.status(201).json(notificationWithRecipients)
  } catch (err) {
    console.error('Error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

router.get('/getAllNotification', isAuthenticated, async (req, res) => {
  const { page = 1, limit = 10, search = '', courseId } = req.query

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

    if (courseId && courseId !== 'undefined') {
      whereClause.courseId = courseId
    }

    const { count, rows: notifications } = await models.Notification.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['notifyAt', 'DESC']]
    })

    res.status(200).json({
      data: notifications,
      meta: {
        totalItems: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit) >= 1 ? Math.ceil(count / limit) : 1
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
        totalPages: Math.ceil(count / limit) >= 1 ? Math.ceil(count / limit) : 1
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

module.exports = router
