const { models } = require('../models')
const { verifyToken } = require('../utils')

const isAuthenticated = async (req, res, next) => {
  let userId = null
  if (req.headers.authorization) {
    const [, accessTokenFromHeader] = req.headers.authorization.split(' ')
    if (accessTokenFromHeader) {
      const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET
      const verified = await verifyToken(
        accessTokenFromHeader,
        accessTokenSecret
      )
      if (verified) {
        userId = verified.payload.id
        req.user = verified.payload
      }
    }
    if (userId) {
      const kq = await models.User.findOne({
        where: {
          id: userId
        }
      })
      if (kq) return next()
    }
  }
  return res.status(401).json({
    code: 401,
    message: 'Unauthorized'
  })
}

module.exports = {
  isAuthenticated
}
