const { DataTypes } = require('sequelize')
const sequelize = require('./init')

const Lession = sequelize.define(
  'Lession',
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
    type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    locationPath: {
      type: DataTypes.STRING,
      allowNull: true
    },
    uploadedBy: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    durationInSecond: {
      type: DataTypes.INTEGER
    }
  },
  {
    tableName: 'lessions',
    timestamps: true
  }
)

module.exports = Lession
