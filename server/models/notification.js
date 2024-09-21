const { DataTypes } = require('sequelize')
const sequelize = require('./init')

const Notification = sequelize.define(
  'Notification',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    message: {
      type: DataTypes.STRING,
      allowNull: true
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '/myCourses'
    },
    isDeleted: {
      type: DataTypes.TINYINT,
      defaultValue: 0
    }
  },
  {
    tableName: 'notifications',
    timestamps: true
  }
)

module.exports = Notification
