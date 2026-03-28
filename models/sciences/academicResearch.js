const Sequelize = require('sequelize')
const sequelize = require('../../config/db-instance')

const academicResearch = sequelize.define(
  'AcademicResearch',
  {
    research_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    student_code: { type: Sequelize.STRING, allowNull: true },
    prefix: { type: Sequelize.STRING(20), allowNull: true },
    firstname: { type: Sequelize.STRING, allowNull: true },
    lastname: { type: Sequelize.STRING, allowNull: true },
    degree_level: { type: Sequelize.STRING(20), allowNull: true },  // ปริญญาโท / ปริญญาเอก
    faculty: { type: Sequelize.STRING, allowNull: true },
    major_name: { type: Sequelize.STRING, allowNull: true },
    thesis_th: { type: Sequelize.TEXT, allowNull: true },
    thesis_en: { type: Sequelize.TEXT, allowNull: true },
    research_status: { type: Sequelize.STRING, allowNull: true },
    journal_name: { type: Sequelize.STRING, allowNull: true },
    publish_type: { type: Sequelize.STRING, allowNull: true },
  },
  {
    timestamps: false,
    tableName: 'AcademicResearch',
  }
)

;(async () => {
  await academicResearch.sync({ alter: true })
})()

module.exports = academicResearch
