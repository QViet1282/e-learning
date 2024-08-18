const { DataTypes } = require('sequelize')
const sequelize = require('./init')

const Lession = sequelize.define(
  'Lession',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    lessionCategoryId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    content: {
      type: DataTypes.STRING
    },
    order: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    locationPath: {
      type: DataTypes.STRING,
      allowNull: true
    },
    uploadedBy: {
      type: DataTypes.BIGINT,
      allowNull: true
    }
  },
  {
    tableName: 'lessions',
    timestamps: true
  }
)

module.exports = Lession
