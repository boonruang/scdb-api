const Sequelize = require('sequelize')
const sequelize = require('../../config/db-instance')

const budgetDisbursement = sequelize.define(
  'BudgetDisbursements',
  {
    disbursement_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    activity_code: {
      type: Sequelize.STRING(30),  // FK → BudgetActivities.activity_code
      allowNull: false,
    },
    disburse_date: {
      type: Sequelize.DATEONLY,
      allowNull: true,
    },
    disburse_type: {
      type: Sequelize.STRING(20),  // '1.ผูกพัน' หรือ '2.จ่ายจริง'
      allowNull: true,
    },
    amount: {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    note: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: false,
    tableName: 'BudgetDisbursements',
  }
)

;(async () => {
  await budgetDisbursement.sync({ force: false })
})()

module.exports = budgetDisbursement
