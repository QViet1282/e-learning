const { DataTypes } = require('sequelize')
const sequelize = require('./init')

const Exam = sequelize.define(
  'Exam',
  {
    studyItemId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true, // Vừa là khóa chính
      references: {
        model: 'study_items',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    durationInMinute: {
      type: DataTypes.INTEGER
    },
    pointToPass: {
      type: DataTypes.INTEGER
    },
    createrId: {
      type: DataTypes.BIGINT
    },
    numberOfAttempt: {
      type: DataTypes.TINYINT
    }
  },
  {
    tableName: 'exams',
    timestamps: true
  }
)

module.exports = Exam
