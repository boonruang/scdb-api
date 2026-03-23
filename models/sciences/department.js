const Sequelize = require('sequelize')
const sequelize = require('../../config/db-instance')
const department = sequelize.define(
  'Departments',
  {
    department_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    department_code: {
      type: Sequelize.STRING(20),
      allowNull: true,
    },
    department_name: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    dept_name: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    dept_type: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: false,
    tableName: 'Departments'
  },
)

;(async () => {
  await department.sync({ alter: true })
})()

module.exports = department