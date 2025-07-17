const Sequelize = require('sequelize')
const sequelize = require('../../config/db-instance')

const academicProgram = sequelize.define(
  'AcademicPrograms',
  {
    program_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    program_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    degree_level: {
      type: Sequelize.STRING,
    },
    department_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Departments',
        key: 'department_id',
      },
    },
  },
  {
    timestamps: false,
    tableName: 'AcademicPrograms'
  },
)

;(async () => {
  await academicProgram.sync({ force: false })
})()

module.exports = academicProgram