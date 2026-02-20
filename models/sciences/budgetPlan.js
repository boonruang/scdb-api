const Sequelize = require('sequelize')
const sequelize = require('../../config/db-instance')

const budgetPlan = sequelize.define(
  'BudgetPlans',
  {
    plan_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    budget_code: {
      type: Sequelize.STRING(20),
      allowNull: false,
    },
    project_name: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    budget_type: {
      type: Sequelize.STRING(50),  // '1.หมวดงบแผ่นดิน', '2.หมวดงบรายได้'
      allowNull: true,
    },
    budget_amount: {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    plan_q1: {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    plan_q2: {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    plan_q3: {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    plan_q4: {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    fiscal_year: {
      type: Sequelize.INTEGER,   // CE year เช่น 2025
      allowNull: true,
    },
  },
  {
    timestamps: false,
    tableName: 'BudgetPlans',
  }
)

;(async () => {
  await budgetPlan.sync({ force: false })
})()

module.exports = budgetPlan
