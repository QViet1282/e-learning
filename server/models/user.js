const { DataTypes } = require('sequelize')
const sequelize = require('./init')

const User = sequelize.define('User', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    allowNull: false,
    unique: true,
    primaryKey: true
  },
  googleId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  firstName: {
    type: DataTypes.STRING
  },
  lastName: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  gender: {
    type: DataTypes.STRING
  },
  age: {
    type: DataTypes.INTEGER
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true // Cho phép trường password là null
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  refreshToken: {
    type: DataTypes.STRING
  },
  expiredToken: {
    type: DataTypes.DATE
  },
  roleId: {
    type: DataTypes.BIGINT,
    allowNull: true,
    defaultValue: 3
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png'
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  otp: {
    type: DataTypes.STRING
  },
  otpExpires: {
    type: DataTypes.DATE
  },
  pendingRevenue: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'users',
  timestamps: true
})

module.exports = User
