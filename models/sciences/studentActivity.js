const Sequelize = require('sequelize')
const sequelize = require('../../config/db-instance')

const studentActivity = sequelize.define(
  'StudentActivities',
  {
    activity_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    activity_code: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    activity_name: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    organizer: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    start_date: {
      type: Sequelize.DATEONLY,
      allowNull: true,
    },
    end_date: {
      type: Sequelize.DATEONLY,
      allowNull: true,
    },
    venue: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    participant_count: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    hours: {
      type: Sequelize.FLOAT,
      allowNull: true,
    },
    budget_amount: {
      type: Sequelize.FLOAT,
      allowNull: true,
    },
    participant_ids: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: false,
    tableName: 'StudentActivities',
  },
)

;(async () => {
  await studentActivity.sync({ alter: true })
})()

module.exports = studentActivity
