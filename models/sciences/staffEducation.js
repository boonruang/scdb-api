const Sequelize = require('sequelize')
const sequelize = require('../../config/db-instance')

const staffEducation = sequelize.define(
  'StaffEducation',
  {
    education_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    staff_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Staff',
        key: 'staff_id',
      },
    },
    degree: {
      type: Sequelize.STRING,
    },
    university: {
      type: Sequelize.STRING,
    },
    year: {
      type: Sequelize.INTEGER,
    },
  },
  {
    timestamps: false,
    tableName: 'StaffEducation'
  },
)

;(async () => {
  await staffEducation.sync({ force: false })
})()

module.exports = staffEducation