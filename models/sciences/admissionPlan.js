const Sequelize = require('sequelize')
const sequelize = require('../../config/db-instance')

const admissionPlan = sequelize.define(
  'AdmissionPlans',
  {
    plan_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    program_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'AcademicPrograms',
        key: 'program_id',
      },
    },
    academic_year: {
      type: Sequelize.INTEGER,
    },
    planned_seats: {
      type: Sequelize.INTEGER,
    },
    actual_admitted: {
      type: Sequelize.INTEGER,
    },
    group_name: {
      type: Sequelize.STRING,
    },
    eligible_count: {
      type: Sequelize.INTEGER,
    },
    admit_pct: {
      type: Sequelize.FLOAT,
    },
  },
  {
    timestamps: false,
    tableName: 'AdmissionPlans'
  },
)

;(async () => {
  await admissionPlan.sync({ alter: true })
})()

module.exports = admissionPlan