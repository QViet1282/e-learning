const { DataTypes } = require('sequelize')
const sequelize = require('./init')

const CourseProgress = sequelize.define(
  'CourseProgress',
  {
    enrollmentId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    studyItemId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false
    },
    completionAt: {
      type: DataTypes.BOOLEAN
    }
  },
  {
    tableName: 'course_progress',
    timestamps: true
  }
)

module.exports = CourseProgress
