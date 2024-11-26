const express = require('express')
const { models } = require('../models')
const bcrypt = require('bcrypt')
const randToken = require('rand-token')
const { errorLogger, infoLogger } = require('../logs/logger')
const passport = require('../passport')
const CryptoJS = require('crypto-js')
const otpGenerator = require('otp-generator')
const crypto = require('crypto')
const transporter = require('../email')

const {
  SALT_KEY,
  generateToken,
  REFRESH_TOKEN_SIZE
} = require('../utils')

const router = express.Router()

// Route to start the authentication process with Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

// Route to handle the callback from Google
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', async (err, user, info) => {
    if (err) {
      // If an error occurs, redirect to the login page
      const redirectUrl = `${process.env.FRONTEND_URL}/login?errorCode=SERVER_ERROR`
      return res.redirect(redirectUrl)
    }

    if (!user) {
      // If the user is not found, redirect to the login page
      const errorCode = info && info.code ? info.code : 'GOOGLE_AUTH_ERROR'
      const redirectUrl = `${process.env.FRONTEND_URL}/login?errorCode=${errorCode}`
      return res.redirect(redirectUrl)
    }

    try {
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

      let refreshToken = randToken.generate(REFRESH_TOKEN_SIZE)
      if (!user.refreshToken) {
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

      const key = CryptoJS.AES.encrypt((dataForAccessToken.GroupWithRoles.description), 'Access_Token_Secret_#$%_ExpressJS_Authentication').toString()

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'Strict',
        maxAge: 30 * 24 * 60 * 60 * 1000
      })
      // Redirect to the login page with the necessary information
      const redirectUrl = `${process.env.FRONTEND_URL}/login?googleAuthSuccess=true&accessToken=${accessToken}&id=${user.id}&firstName=${encodeURIComponent(user.firstName)}&lastName=${encodeURIComponent(user.lastName)}&email=${encodeURIComponent(user.email)}&key=${encodeURIComponent(key)}&avatar=${encodeURIComponent(user.avatar)}&username=${encodeURIComponent(user.username)}`
      res.redirect(redirectUrl)
    } catch (err) {
      // If an error occurs, redirect to the login page with the error code LOGIN_ERROR
      console.error('Token generation error:', err)
      const redirectUrl = `${process.env.FRONTEND_URL}/login?errorCode=LOGIN_ERROR`
      res.redirect(redirectUrl)
    }
  })(req, res, next)
})

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body.data
    console.log(username, email)

    const userByUsername = await models.User.findOne({
      where: { username }
    })

    const userByEmail = await models.User.findOne({
      where: { email }
    })

    if (userByUsername) {
      return res.status(409).json({
        code: 409,
        message: 'Username already exists'
      })
    }

    if (userByEmail) {
      return res.status(409).json({
        code: 409,
        message: 'Email already exists'
      })
    }

    const hashPassword = bcrypt.hashSync(password, SALT_KEY)
    const newUser = {
      username,
      email,
      password: hashPassword,
      type: 'local'
    }
    const createdUser = await models.User.create(newUser)
    if (!createdUser) {
      return res.status(400).json({
        code: 400,
        message: 'Create new account failed'
      })
    }
    return res.json({
      username,
      email,
      status: 'Register success!'
    })
  } catch (error) {
    console.error('Error during user registration:', error)
    return res.status(500).json({
      code: 500,
      message: 'Internal server error. Please try again later'
    })
  }
})

router.post('/login', async (req, res) => {
  console.log('LOGINNNNNNNNNNNNNNNNNNN')
  try {
    const { email, password, keepMeLoggedIn } = req.body.data
    const user = await models.User.findOne({
      where: { email }
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
        message: 'User not found'
      })
    }
    const type = user.type
    if (type === 'google') {
      return res.status(401).json({
        code: 401,
        message: 'Please login with google'
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
        message: 'Incorrect password'
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
        obj: { email }
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
      obj: { email }
    })

    const encryptedGroupWithRoles = CryptoJS.AES.encrypt((dataForAccessToken.GroupWithRoles.description), 'Access_Token_Secret_#$%_ExpressJS_Authentication').toString()

    // Set refresh token cookie with long expiration time if "Keep me logged in" is selected
    const cookieOptions = {
      httpOnly: true,
      sameSite: 'Strict',
      maxAge: keepMeLoggedIn ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 30 day or 1 day
      // secure: process.env.NODE_ENV === 'production'
    }
    res.cookie('refreshToken', refreshToken, cookieOptions)

    return res.json({
      accessToken,
      username: user.username,
      key: encryptedGroupWithRoles,
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar
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
// Fix the issue where logout can still be performed without a refreshToken
router.post('/logout', async (req, res, next) => {
  console.log('LOGGGGOUTTTTTTTTTTTT')
  try {
    const { refreshToken } = req.cookies
    console.log(refreshToken, 'refreshTokenNnNnNnN')
    if (!refreshToken) {
      res.cookie('refreshToken', '', { expires: new Date(0) })
      return res.status(200).json({ message: 'Logout success!' })
    }
    const userId = await verifyRefreshToken(refreshToken)
    if (!userId) {
      res.cookie('refreshToken', '', { expires: new Date(0) })
      return res.status(200).json({ message: 'Logout success!' })
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
      email: user.email,
      avatar: user.avatar
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

// Send OTP via email to reset password
router.post('/sendOTP', async (req, res) => {
  console.log('SEND OTP', req.body.data)
  const { email, language } = req.body.data
  try {
    // Find user by email
    const user = await models.User.findOne({ where: { email } })
    if (!user) {
      return res.status(404).json({ code: 404, message: 'User not found' })
    }

    // Check user type
    if (user.type !== 'local') {
      return res.status(403).json({ code: 403, message: 'OTP can only be sent to local users' })
    }

    // Generate 6-digit OTP
    const otp = otpGenerator.generate(6, { digits: true, upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false })
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex')

    // Save OTP to database and set expiration time
    user.otp = hashedOTP
    user.otpExpires = Date.now() + 70000 // OTP expires after 1 minute 10 seconds
    await user.save()

    // Send email with OTP
    const mailOptions1 = {
      from: `E-Leaning 👻 <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Mã OTP Đặt Lại Mật Khẩu',
      html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #4CAF50; text-align: center;">Mã OTP của bạn</h2>
        <p style="font-size: 18px; text-align: center;">Sử dụng mã OTP sau để đặt lại mật khẩu của bạn:</p>
        <div style="padding: 10px; background-color: #f9f9f9; border-radius: 5px; text-align: center;">
          <span style="font-size: 24px; font-weight: bold; color: #000;">${otp}</span>
        </div>
        <p style="font-size: 14px; color: #999; text-align: center;">Mã OTP này có hiệu lực trong 1 phút.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #777; text-align: center;">Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
      </div>
      `
    }

    // Send email with OTP
    const mailOptions = {
      from: `E-Leaning 👻 <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Password OTP',
      html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #4CAF50; text-align: center;">Your OTP Code</h2>
        <p style="font-size: 18px; text-align: center;">Use the following OTP code to reset your password:</p>
        <div style="padding: 10px; background-color: #f9f9f9; border-radius: 5px; text-align: center;">
          <span style="font-size: 24px; font-weight: bold; color: #000;">${otp}</span>
        </div>
        <p style="font-size: 14px; color: #999; text-align: center;">This OTP is valid for 1 minute.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #777; text-align: center;">If you did not request this, please ignore this email.</p>
      </div>
      `
    }
    if (language) {
      if (language === 'vi') {
        await transporter.sendMail(mailOptions1)
      } else {
        await transporter.sendMail(mailOptions)
      }
    } else {
      await transporter.sendMail(mailOptions)
    }
    res.status(200).json({ code: 200, message: 'OTP sent to your email' })
  } catch (error) {
    console.error('Error sending OTP:', error)
    res.status(500).json({ code: 500, message: 'Error sending OTP', error: error.message })
  }
})

// Verify OTP
router.post('/verifyOTP', async (req, res) => {
  console.log('VERIFY OTP', req.body)
  const { email, otp } = req.body.data

  try {
    // Find user by email
    const user = await models.User.findOne({ where: { email } })
    if (!user) {
      return res.status(404).json({ code: 404, message: 'User not found' })
    }

    // Check OTP
    const now = Date.now()
    if (now > user.otpExpires) {
      return res.status(403).json({ code: 403, message: 'OTP has expired' })
    }

    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex')
    if (hashedOTP !== user.otp) {
      return res.status(400).json({ code: 400, message: 'Invalid OTP' })
    }

    // OTP is valid, proceed to reset password step
    res.status(200).json({ code: 200, message: 'OTP verified successfully. You can now reset your password.' })
  } catch (error) {
    console.error('Error verifying OTP:', error)
    res.status(500).json({ code: 500, message: 'Error verifying OTP', error: error.message })
  }
})

// Reset new password after OTP has been verified
router.post('/resetPassword', async (req, res) => {
  console.log('RESET PASSWORD', req.body)
  const { email, newPassword } = req.body.data

  try {
    // Find user by email
    const user = await models.User.findOne({ where: { email } })
    if (!user) {
      return res.status(404).json({ code: 404, message: 'User not found' })
    }

    // Check if OTP has been verified
    if (!user.otp) {
      return res.status(400).json({ code: 400, message: 'OTP not verified or already used' })
    }

    // Update new password
    const hashPassword = bcrypt.hashSync(newPassword, SALT_KEY)
    user.password = hashPassword
    user.otp = null // Clear OTP after successful password reset
    user.otpExpires = null // Clear OTP expiration time
    await user.save()

    res.status(200).json({ code: 200, message: 'Password updated successfully' })
  } catch (error) {
    console.error('Error resetting password:', error)
    res.status(500).json({ code: 500, message: 'Error resetting password', error: error.message })
  }
})

module.exports = router
