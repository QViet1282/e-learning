const express = require('express')
const { models } = require('../models')
const { isAuthenticated } = require('../middlewares/authentication')
const { Op } = require('sequelize')
const bcrypt = require('bcrypt')
const {
  SALT_KEY
} = require('../utils')

const router = express.Router()
const { infoLogger, errorLogger } = require('../logs/logger')

const MASSAGE = {
  USER_NOT_FOUND: 'User not found',
  NO_CREATE_USER: 'No can not create user',
  NO_UPDATE_USER: 'No can not update user',
  NO_DELETE_USER: 'No can not delete user',
  USERNAME_ALREADY_EXISTS: 'Username already exists',
  REQUIRED: 'Username or password or roleId are required',
  ROLE_NOT_FOUND: 'Role not found',
  DELETE_USER_SUCCESS: 'Delete user successfully',
  UPDATE_USER_SUCCESS: 'Update user',
  UPDATE_USER_ERROR: 'You can not update user role',
  NO_UPDATE: 'Current Password is incorrect'
}

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

async function checkAndUpdateUserRole (req, res, next) {
  try {
    const { id } = req.params
    const { roleId, firstName, lastName, email, gender, age, password, currentPassword } = req.body.data
    const userToEdit = await models.User.findByPk(id)
    console.log('------------------------------------------------------')
    console.log('check payload', req.body.data)
    console.log('check user to edit', userToEdit)

    if (!userToEdit) {
      logError(req, MASSAGE.USER_NOT_FOUND)
      return res.status(404).json({ message: MASSAGE.USER_NOT_FOUND })
    }

    const currentUserRole = req.user.GroupWithRoles.id
    const userToEditRole = userToEdit.roleId

    // console.log('------------------------------------------------------')
    // console.log('check user', req.user)
    // console.log('check current user role', currentUserRole)
    // console.log('check user to edit role', userToEditRole)
    // console.log('check new role', roleId)
    // console.log('------------------------------------------------------')
    // console.log('check params', req.params)
    // console.log('check body', req.body.data)

    let updatedUser
    console.log('check password', password)
    console.log('check current password', currentPassword)
    console.log('check user to edit password', userToEdit.password)

    if (password) {
      const isPasswordValid = bcrypt.compareSync(currentPassword, userToEdit.password)
      if (!isPasswordValid) {
        return res.status(400).json({ message: MASSAGE.NO_UPDATE, field: 'currentPassword' })
      }
      const hashPassword = bcrypt.hashSync(password, SALT_KEY)
      updatedUser = await userToEdit.update({ firstName, lastName, email, gender, age, password: hashPassword })
    } else {
      updatedUser = await userToEdit.update({ firstName, lastName, email, gender, age })
    }

    if (!updatedUser) {
      logError(req, MASSAGE.NO_UPDATE_USER)
      return res.status(400).json({ message: MASSAGE.NO_UPDATE_USER })
    }
    logInfo(req, updatedUser)

    // Check role update permissions
    if (roleId === 1 && currentUserRole !== 1) {
      return res.status(403).json({ message: MASSAGE.UPDATE_USER_ERROR })
    }
    if (currentUserRole === 2 && roleId === 1) {
      return res.status(403).json({ message: MASSAGE.UPDATE_USER_ERROR })
    } else if (currentUserRole === 1) {
      const updatedUser = await userToEdit.update({ roleId })
      if (!updatedUser) {
        logError(req, MASSAGE.NO_UPDATE_USER)
        return res.status(400).json({ message: MASSAGE.NO_UPDATE_USER })
      }
      logInfo(req, updatedUser)
    } else if (currentUserRole === 2 && (userToEditRole !== 1)) {
      const updatedUser = await userToEdit.update({ roleId })
      if (!updatedUser) {
        logError(req, MASSAGE.NO_UPDATE_USER)
        return res.status(400).json({ message: MASSAGE.NO_UPDATE_USER })
      }
      logInfo(req, updatedUser)
    }

    return res.json(updatedUser)
  } catch (error) {
    logError(req, error)
    res.status(500).json({ message: MASSAGE.NO_UPDATE_USER })
  }
}

// edit user
router.put('/:id', isAuthenticated, checkAndUpdateUserRole)

// find user by id
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params
    const user = await models.User.findByPk(id)
    if (!user) {
      logError(req, MASSAGE.USER_NOT_FOUND)
      return res.status(404).json({ message: MASSAGE.USER_NOT_FOUND })
    }
    logInfo(req, user)
    res.json(user)
  } catch (error) {
    logError(req, error)
    res.status(500).json({ message: MASSAGE.USER_NOT_FOUND })
  }
})

router.get('/getEnrollmentUserByCourseId/:courseId', isAuthenticated, async (req, res) => {
  try {
    const courseId = req.params.courseId
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit
    const searchQuery = req.query.search?.trim() || ''

    // Tạo điều kiện tìm kiếm
    let searchConditions = []
    if (searchQuery) {
      const tokens = searchQuery.split(' ') // Tách chuỗi thành các từ
      // Tạo điều kiện tìm kiếm với từng token
      searchConditions = tokens.map((token) => ({
        [Op.or]: [
          { firstName: { [Op.like]: `%${token}%` } },
          { lastName: { [Op.like]: `%${token}%` } },
          { email: { [Op.like]: `%${token}%` } }
        ]
      }))
    }

    const { rows, count } = await models.User.findAndCountAll({
      where: {
        [Op.and]: searchConditions.length > 0
          ? {
              [Op.or]: searchConditions.flatMap(condition => condition[Op.or])
            }
          : {} // Nếu không có điều kiện tìm kiếm, trả về tất cả người dùng
      },
      include: [
        {
          model: models.Order,
          attributes: ['id'],
          include: [
            {
              model: models.Enrollment,
              attributes: ['enrollmentDate'],
              required: true,
              where: { courseId }
            }
          ]
        }
      ],
      limit,
      offset,
      attributes: ['id', 'avatar', 'firstName', 'lastName', 'email'],
      distinct: true
    })

    const users = rows.map((user) => {
      const enrollment = user.Orders?.[0]?.Enrollments?.[0] || {}
      return {
        id: user.id,
        avatar: user.avatar,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        enrollmentDate: enrollment.enrollmentDate || null
      }
    })

    const totalPages = Math.ceil((count < users.length && users.length < 10) ? count : users.length / limit) // Sử dụng count thay vì users.length

    res.json({
      totalItems: (count < users.length && users.length < 10) ? count : users.length,
      totalPages,
      currentPage: page,
      users
    })
  } catch (error) {
    logError(req, error)
    res.status(500).json({ message: 'Có lỗi xảy ra khi lấy danh sách học viên', error })
  }
})

module.exports = router
