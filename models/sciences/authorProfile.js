const Sequelize = require('sequelize')
const sequelize = require('../../config/db-instance')

const AuthorProfile = sequelize.define(
  'AuthorProfile',
  {
    author_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    // ── ข้อมูลพื้นฐาน ──────────────────────────────────────────────────────
    spreadsheet_id: { type: Sequelize.STRING(20), allowNull: true },
    title_th:       { type: Sequelize.STRING(20), allowNull: true },
    firstname_th:   { type: Sequelize.STRING,     allowNull: true },
    lastname_th:    { type: Sequelize.STRING,     allowNull: true },
    firstname:      { type: Sequelize.STRING,     allowNull: true },
    lastname:       { type: Sequelize.STRING,     allowNull: true },
    position:       { type: Sequelize.STRING,     allowNull: true },
    position_no:    { type: Sequelize.STRING(20), allowNull: true },
    dept_name:      { type: Sequelize.STRING,     allowNull: true },  // string เฉยๆ ไม่ FK
    email:          { type: Sequelize.STRING,     allowNull: true },
    phone_no:       { type: Sequelize.STRING,     allowNull: true },
    photo_url:      { type: Sequelize.TEXT,       allowNull: true },
    // ── ข้อมูลวิจัย ─────────────────────────────────────────────────────────
    citations_total:        { type: Sequelize.INTEGER, allowNull: true },
    publications_count:     { type: Sequelize.INTEGER, allowNull: true },
    h_index:                { type: Sequelize.INTEGER, allowNull: true },
    docs_current_year:      { type: Sequelize.INTEGER, allowNull: true },
    citations_current_year: { type: Sequelize.INTEGER, allowNull: true },
    scopus_url:    { type: Sequelize.TEXT, allowNull: true },
    scholar_url:   { type: Sequelize.TEXT, allowNull: true },
    expertise:     { type: Sequelize.TEXT, allowNull: true },
    interests:     { type: Sequelize.TEXT, allowNull: true },
    research_fund: { type: Sequelize.TEXT, allowNull: true },
    ethics_license:{ type: Sequelize.STRING, allowNull: true },
  },
  {
    tableName: 'AuthorProfiles',
    timestamps: false,
    sync: { alter: true },
  }
)

module.exports = AuthorProfile
