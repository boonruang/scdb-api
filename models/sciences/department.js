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
    dept_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    dept_type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: 'Departments'
  },
)

;(async () => {
  await department.sync({ force: false })
})()

module.exports = department