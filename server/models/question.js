const { DataTypes } = require('sequelize')
const sequelize = require('./init')

const Question = sequelize.define(
  'Question',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    instruction: {
      type: DataTypes.TEXT
    },
    content: {
      type: DataTypes.TEXT
    },
    type: {
      type: DataTypes.STRING
    },
    order: {
      type: DataTypes.INTEGER
    },
    a: {
      type: DataTypes.TEXT
    },
    b: {
      type: DataTypes.TEXT
    },
    c: {
      type: DataTypes.TEXT
    },
    d: {
      type: DataTypes.TEXT
    },
    e: {
      type: DataTypes.TEXT
    },
    f: {
      type: DataTypes.TEXT
    },
    g: {
      type: DataTypes.TEXT
    },
    h: {
      type: DataTypes.TEXT
    },
    answer: {
      type: DataTypes.TEXT
    },
    explanation: {
      type: DataTypes.TEXT
    },
    isQuestionStopped: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    examId: {
      type: DataTypes.BIGINT
    }
  },
  {
    tableName: 'questions',
    timestamps: true
  }
)

module.exports = Question
