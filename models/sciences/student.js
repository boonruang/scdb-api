const Sequelize = require('sequelize')
const sequelize = require('../../config/db-instance')

const student = sequelize.define(
  'Students',
  {
    student_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    studentOfficial_id: {
      type: Sequelize.STRING,
      allowNull: true,
    },    
    firstname: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastname: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    major_name: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    department_name: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    entry_year: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: false,
    tableName: 'Students'
  },
)

;(async () => {
  await student.sync({ alter: true })
})()

module.exports = student