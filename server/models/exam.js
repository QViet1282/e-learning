const { DataTypes } = require('sequelize')
const sequelize = require('./init')

const Exam = sequelize.define(
  'Exam',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    categoryExamId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    lessionId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
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
