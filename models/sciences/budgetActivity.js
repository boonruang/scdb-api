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
    target_student_y1:    { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },
    target_student_y2:    { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },
    target_student_y3:    { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },
    target_student_y4:    { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },
    target_admin:         { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },
    target_academic:      { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },
    target_support:       { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },
    target_student_ext:   { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },
    target_public:        { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },
    strategy:             { type: Sequelize.STRING, allowNull: true },
    student_dev_standard: { type: Sequelize.STRING, allowNull: true },
    sdgs:                 { type: Sequelize.STRING, allowNull: true },
    bcg:                  { type: Sequelize.STRING, allowNull: true },
    smart_university:     { type: Sequelize.STRING, allowNull: true },
    venue:                { type: Sequelize.TEXT, allowNull: true },
    output_text:          { type: Sequelize.TEXT, allowNull: true },
    target_value:         { type: Sequelize.TEXT, allowNull: true },
    outcome:              { type: Sequelize.TEXT, allowNull: true },
    impact:               { type: Sequelize.TEXT, allowNull: true },
    note:                 { type: Sequelize.TEXT, allowNull: true },
  },
  {
    timestamps: false,
    tableName: 'BudgetActivities',
  }
)

;(async () => {
  await budgetActivity.sync({ alter: true })
})()

module.exports = budgetActivity
