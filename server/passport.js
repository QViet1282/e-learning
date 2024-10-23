const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const User = require('./models/user')
require('dotenv').config()

// Configure Passport to use Google OAuth 2.0
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.REACT_APP_API}/auth/google/callback` // Callback URL after successful authentication
    },
    async (token, tokenSecret, profile, done) => {
      try {
        console.log('check', profile)
        // Find user in the database by googleId
        const user = await User.findOne({ where: { googleId: profile.id } })

        if (user) {
          // If user exists, return that user
          return done(null, user)
        } else {
          // If user does not exist, check if email exists
          const existingUserByEmail = await User.findOne({
            where: { email: profile.emails[0].value }
          })

          if (existingUserByEmail) {
          // If email is already used, return an error
            return done(null, false, { code: 'LOCAL_ACCOUNT_EXISTS' })
          }
          // If email is not used, create a new user
          const newUser = await User.create({
            googleId: profile.id,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            username: profile.emails[0].value.split('@')[0],
            roleId: 3,
            avatar: profile.photos[0].value,
            type: 'google'
          })

          return done(null, newUser)
        }
      } catch (error) {
        return done(error, null)
      }
    }
  )
)

// passport.serializeUser((user, done) => {
//   done(null, user.id)
// })

// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findByPk(id)
//     done(null, user)
//   } catch (err) {
//     done(err, null)
//   }
// })

module.exports = passport
