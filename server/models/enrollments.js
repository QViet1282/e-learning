const { DataTypes } = require('sequelize')
const sequelize = require('./init')

const Enrollment = sequelize.define(
  'Enrollment',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    courseId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    orderId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    enrollmentDate: {
      type: DataTypes.DATE
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    progress: {
      type: DataTypes.DECIMAL(40, 20),
      defaultValue: 0
    },
    completedDate: {
      type: DataTypes.DATE,
      defaultValue: null
    },
    rating: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ratingDate: {
      type: DataTypes.DATE,
      defaultValue: null
    },
    teacherComment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    teacherCommentDate: {
      type: DataTypes.DATE,
      defaultValue: null
    }
  },
  {
    tableName: 'enrollments',
    timestamps: true
  }
)

module.exports = Enrollment
