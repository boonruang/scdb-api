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
    // ── ข้อมูลพื้นฐาน ─────────────────────────────────────────────────────────
    spreadsheet_id: {
      type: Sequelize.STRING(20),
      allowNull: true,   // เช่น "A1", "B1"
    },
    title_th: {
      type: Sequelize.STRING(20),
      allowNull: true,   // คำนำหน้า เช่น นาย, นาง, นางสาว
    },
    firstname_th: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    lastname_th: {
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
    position: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    education: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    startdate: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    position_no: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    birthday: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    department_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'Departments', key: 'department_id' },
    },
    stafftype_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'Stafftype', key: 'stafftype_id' },
    },
    email: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    office_location: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    phone_no: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    // ── ข้อมูลวิจัย (Scopus / Scholar) ───────────────────────────────────────
    citations_total: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    publications_count: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    h_index: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    docs_current_year: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    citations_current_year: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    scopus_url: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    scholar_url: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    photo_url: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    expertise: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    interests: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    research_fund: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    ethics_license: {
      type: Sequelize.STRING,
      allowNull: true,
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
