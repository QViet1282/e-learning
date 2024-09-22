const { DataTypes } = require('sequelize')
const sequelize = require('./init')

const CourseReview = sequelize.define(
  'CourseReview',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    enrollId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    courseId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    rating: {
      type: DataTypes.TINYINT,
      allowNull: false
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    tableName: 'course_reviews',
    timestamps: true
  }
)

module.exports = CourseReview
