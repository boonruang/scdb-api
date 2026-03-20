const Sequelize = require('sequelize')
const sequelize = require('../../config/db-instance')

const studentAward = sequelize.define(
  'StudentAwards',
  {
    award_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    student_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Students',
        key: 'student_id',
      },
    },
    award_name: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    award_level: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    venue: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    award_date: {
      type: Sequelize.DATEONLY,
      allowNull: true,
    },
  },
  {
    timestamps: false,
    tableName: 'StudentAwards',
  },
)

;(async () => {
  await studentAward.sync({ alter: true })
})()

module.exports = studentAward
