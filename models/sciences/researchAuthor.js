const Sequelize = require('sequelize')
const sequelize = require('../../config/db-instance')

// ตาราง ResearchAuthors — ตาราง author กลางที่ sync มาจาก AuthorProfiles + AuthorProfileSupports
// ใช้เป็น FK target ของ PublicationAuthors
// spreadsheet_id (A1, A2, B1...) เป็น unique key เชื่อมกับ Paper sheet

const ResearchAuthor = sequelize.define(
  'ResearchAuthor',
  {
    research_author_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    spreadsheet_id: { type: Sequelize.STRING(20), allowNull: true, unique: true },
    staff_type:     { type: Sequelize.STRING(20), allowNull: true },  // 'วิชาการ' | 'สนับสนุน'
    title_th:       { type: Sequelize.STRING(20), allowNull: true },
    firstname_th:   { type: Sequelize.STRING,     allowNull: true },
    lastname_th:    { type: Sequelize.STRING,     allowNull: true },
    firstname:      { type: Sequelize.STRING,     allowNull: true },
    lastname:       { type: Sequelize.STRING,     allowNull: true },
    position:       { type: Sequelize.STRING,     allowNull: true },
    position_no:    { type: Sequelize.STRING(20), allowNull: true },
    dept_name:      { type: Sequelize.STRING,     allowNull: true },
  },
  {
    tableName: 'ResearchAuthors',
    timestamps: false,
  }
)

;(async () => { await ResearchAuthor.sync({ alter: true }) })()

module.exports = ResearchAuthor
