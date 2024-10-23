const { DataTypes } = require('sequelize')
const sequelize = require('./init')

const Order = sequelize.define(
  'Order',
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
    orderDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    totalAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    paymentMethod: {
      type: DataTypes.STRING
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: 'orders',
    timestamps: true
  }
)

module.exports = Order
