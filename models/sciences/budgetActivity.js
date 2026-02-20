const Sequelize = require('sequelize')
const sequelize = require('../../config/db-instance')

const budgetActivity = sequelize.define(
  'BudgetActivities',
  {
    activity_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    budget_code: {
      type: Sequelize.STRING(20),  // FK → BudgetPlans.budget_code
      allowNull: false,
    },
    activity_code: {
      type: Sequelize.STRING(30),  // รหัสย่อย เช่น 6820911055001
      allowNull: true,
    },
    activity_name: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    budget_requested: {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    start_date: {
      type: Sequelize.DATEONLY,
      allowNull: true,
    },
    end_date: {
      type: Sequelize.DATEONLY,
      allowNull: true,
    },
  },
  {
    timestamps: false,
    tableName: 'BudgetActivities',
  }
)

;(async () => {
  await budgetActivity.sync({ force: false })
})()

module.exports = budgetActivity
