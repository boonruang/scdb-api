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
  },
  {
    timestamps: false,
    tableName: 'AdmissionPlans'
  },
)

;(async () => {
  await admissionPlan.sync({ force: false })
})()

module.exports = admissionPlan