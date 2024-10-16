// models/StudyItem.js

const { DataTypes } = require('sequelize')
const sequelize = require('./init')

const StudyItem = sequelize.define(
  'StudyItem',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    lessionCategoryId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    order: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    itemType: {
      type: DataTypes.ENUM('lession', 'exam'),
      allowNull: false
    },
    status: {
      type: DataTypes.TINYINT(4),
      allowNull: false,
      defaultValue: 1
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
    tableName: 'study_items',
    timestamps: true
  }
)

module.exports = StudyItem
