const { DataTypes } = require('sequelize')
const sequelize = require('./init')

const AlertRecipientsList = sequelize.define(
  'AlertRecipientsList',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    notificationId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    tableName: 'alert_recipients_list',
    timestamps: true
  }
)

module.exports = AlertRecipientsList
