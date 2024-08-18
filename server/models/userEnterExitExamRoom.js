const { DataTypes } = require('sequelize')
const sequelize = require('./init')

const UserEnterExitExamRoom = sequelize.define(
  'UserEnterExitExamRoom',
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
    examId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    enterTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    exitTime: {
      type: DataTypes.DATE
    },
    attempt: {
      type: DataTypes.TINYINT
    }
  },
  {
    tableName: 'user_enter_exit_exam_room',
    timestamps: true
  }
)

module.exports = UserEnterExitExamRoom
