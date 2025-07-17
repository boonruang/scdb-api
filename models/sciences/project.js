const Sequelize = require('sequelize')
const sequelize = require('../../config/db-instance')

const project = sequelize.define(
  'Projects',
  {
    project_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    project_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    project_type: {
      type: Sequelize.STRING,
    },
    responsible_dept_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Departments',
        key: 'department_id',
      },
    },
    start_date: {
      type: Sequelize.DATE,
    },
    end_date: {
      type: Sequelize.DATE,
    },
    budget_source: {
      type: Sequelize.STRING,
    },
    budget_amount: {
      type: Sequelize.FLOAT,
    },
    status: {
      type: Sequelize.STRING,
    },
  },
  {
    timestamps: false,
    tableName: 'Projects'
  },
)

;(async () => {
  await project.sync({ force: false })
})()

module.exports = project