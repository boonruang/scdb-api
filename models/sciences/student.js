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
    program_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'AcademicPrograms',
        key: 'program_id',
      },
    },
    advisor_staff_id: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Staff',
        key: 'staff_id',
      },
    },
  },
  {
    timestamps: false,
    tableName: 'Students'
  },
)

;(async () => {
  await student.sync({ force: false })
})()

module.exports = student