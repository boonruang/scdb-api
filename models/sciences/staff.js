const Sequelize = require('sequelize')
const sequelize = require('../../config/db-instance')

const staff = sequelize.define(
  'Staff',
  {
    staff_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    position: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    staff_type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    department_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Departments',
        key: 'department_id',
      },
    },
    email: {
      type: Sequelize.STRING,
    },
    office_location: {
      type: Sequelize.STRING,
    },
    scopus_url: {
      type: Sequelize.STRING,
    },
  },
  {
    timestamps: false,
    tableName: 'Staff'
  },
)

;(async () => {
  await staff.sync({ force: false })
})()

module.exports = staff