const { DataTypes } = require('sequelize')
const sequelize = require('./init')

const PayoutRequest = sequelize.define('PayoutRequest', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  instructorId: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  totalRevenue: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  serviceFee: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  payoutAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Success', 'Fail'),
    allowNull: false,
    defaultValue: 'Pending'
  },
  bankName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cardholderName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cardNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  payoutDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  note: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  }
}, {
  tableName: 'payout_requests',
  timestamps: true
})

module.exports = PayoutRequest
