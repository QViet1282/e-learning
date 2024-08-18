const { DataTypes } = require('sequelize')
const sequelize = require('./init')

const ExamQuestion = sequelize.define(
  'ExamQuestion',
  {
    examId: {
      type: DataTypes.BIGINT,
      primaryKey: true
    },
    questionId: {
      type: DataTypes.BIGINT,
      primaryKey: true
    }
  },
  {
    tableName: 'exams_questions',
    timestamps: true
  }
)

module.exports = ExamQuestion
