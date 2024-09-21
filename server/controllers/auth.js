const express = require('express')
const { models } = require('../models')
const bcrypt = require('bcrypt')
const randToken = require('rand-token')
const { errorLogger, infoLogger } = require('../logs/logger')

const CryptoJS = require('crypto-js')

const {
  SALT_KEY,
  generateToken,
  REFRESH_TOKEN_SIZE
} = require('../utils')

const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body.data
    console.log(username)
    const user = await models.User.findOne({
      where: { username }
    })

    if (user) {
      res.status(409).json({
        code: 409,
        message: 'Create new account failed.'
      })
    } else {
      const hashPassword = bcrypt.hashSync(password, SALT_KEY)
      const newUser = {
        username,
        password: hashPassword
      }
      const createdUser = await models.User.create(newUser)
      if (!createdUser) {
        return res.status(400).json({
          code: 400,
          message: 'Create new account failed.'
        })
      }
      return res.json({
        username,
        status: 'Register success!'
      })
    }
  } catch (error) {
    console.log(error)
    res.json({ error })
  }
})

router.post('/login', async (req, res) => {
  console.log('LOGINNNNNNNNNNNNNNNNNNN')
  try {
    const { username, password } = req.body.data
    const user = await models.User.findOne({
      where: { username }
    })
    // console.log(user, 'user')
    if (!user) {
      errorLogger.error({
        message: 'Login faileddddd!',
        path: '/login',
        method: 'POST'
      })
      return res.status(401).json({
        code: 401,
        message: 'Login failed.'
      })
    }
    const isPasswordValid = bcrypt.compareSync(password, user.password)
    if (!isPasswordValid) {
      errorLogger.error({
        message: 'Login failedd!',
        path: '/login',
        method: 'POST'
      })
      return res.status(401).json({
        code: 401,
        message: 'Login failed.'
      })
    }
    const accessTokenLife = process.env.ACCESS_TOKEN_LIFE
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET

    const getGroupWithRoles = async (user) => {
      const roles = await models.Role.findOne({
        where: { id: user.roleId },
        attributes: ['id', 'name', 'description']
      })
      return roles
    }

    const dataForAccessToken = {
      id: user.id,
      GroupWithRoles: await getGroupWithRoles(user)
    }
    const accessToken = await generateToken(
      dataForAccessToken,
      accessTokenSecret,
      accessTokenLife
    )
    console.log(accessToken)
    if (!accessToken) {
      errorLogger.error({
        message: 'Create access token failed!',
        path: '/login',
        method: 'POST',
        obj: { username }
      })
      return res
        .status(401)
        .json({ code: 401, message: 'Login failed.' })
    }

    let refreshToken = randToken.generate(REFRESH_TOKEN_SIZE)
    if (!user.refreshToken) {
      console.log('Create new refresh token')
      user.set({
        refreshToken
      })
      await user.save()
    } else {
      refreshToken = user.refreshToken
    }
    const expiredToken = new Date()
    expiredToken.setMonth(expiredToken.getMonth() + 1)
    await models.User.update({ expiredToken }, { where: { id: user.id } })

    infoLogger.info({
      message: 'Login success!',
      path: '/login',
      method: 'POST',
      obj: { username }
    })

    const encryptedGroupWithRoles = CryptoJS.AES.encrypt((dataForAccessToken.GroupWithRoles.description), 'Access_Token_Secret_#$%_ExpressJS_Authentication').toString()

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'Strict',
      maxAge: 30 * 24 * 60 * 60 * 1000
    })

    return res.json({
      accessToken,
      username,
      key: encryptedGroupWithRoles,
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    })
  } catch (error) {
    errorLogger.error({
      message: 'Login failed!',
      path: '/login',
      method: 'POST'
    })
    console.log(error)
    res.json({ error })
  }
})
router.post('/logout', async (req, res, next) => {
  console.log('LOGGGGOUTTTTTTTTTTTT')
  try {
    const { refreshToken } = req.cookies
    console.log(refreshToken, 'refreshTokenNnNnNnN')
    if (!refreshToken) {
      return res.status(403).json({ error: { message: 'Unauthorized' } })
    }
    const userId = await verifyRefreshToken(refreshToken)
    if (!userId) {
      res.cookie('refreshToken', '', { expires: new Date(0) })
      return res.status(403).json({ error: { message: 'Unauthorized' } })
    }
    const user = await models.User.findByPk(userId)
    res.cookie('refreshToken', '', { expires: new Date(0) })
    user.refreshToken = null
    user.expiredToken = null
    await user.save()
    return res.status(200).json({ message: 'Logout success!' })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
})
router.post('/refresh', async (req, res, next) => {
  console.log('REFRESH TOKENNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN')
  try {
    console.log(req.cookies, 'req.cookies')
    const refreshToken = req.cookies.refreshToken
    console.log(refreshToken, 'refreshToken')
    if (!refreshToken) {
      return res.status(403).json({ error: { message: 'Unauthorized' } })
    }
    const userId = await verifyRefreshToken(refreshToken)
    if (!userId) {
      res.cookie('refreshToken', '', { expires: new Date(0) })
      return res.status(403).json({ error: { message: 'Unauthorized' } })
    }
    console.log(userId, 'userIddddddddddddddddddddddddddddddd')
    const user = await models.User.findByPk(userId)

    const accessTokenLife = process.env.ACCESS_TOKEN_LIFE
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET

    const getGroupWithRoles = async (user) => {
      const roles = await models.Role.findOne({
        where: { id: user.roleId },
        attributes: ['id', 'name', 'description']
      })
      return roles
    }

    const dataForAccessToken = {
      id: user.id,
      GroupWithRoles: await getGroupWithRoles(user)
    }
    const accessToken = await generateToken(
      dataForAccessToken,
      accessTokenSecret,
      accessTokenLife
    )
    const encryptedGroupWithRoles = CryptoJS.AES.encrypt((dataForAccessToken.GroupWithRoles.description), 'Access_Token_Secret_#$%_ExpressJS_Authentication').toString()
    return res.json({
      accessToken,
      username: user.username,
      key: encryptedGroupWithRoles,
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    })
  } catch (error) {
    console.log(error, 'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDĐ')
    res.json({ error: { message: 'dddddddddddddd' } })
  }
})
const verifyRefreshToken = async (refreshToken) => {
  try {
    const user = await models.User.findOne({ where: { refreshToken } })
    if (!user) {
      throw new Error('Token not found')
    }
    const now = new Date()
    if (user.expiredToken < now || !user.expiredToken) {
      console.log('Token has expired')
      user.expiredToken = null
      await user.save()
      throw new Error('Token has expired')
    }
    return user.id
  } catch (err) {
    return null
  }
}

module.exports = router
