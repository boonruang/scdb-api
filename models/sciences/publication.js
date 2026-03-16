const Sequelize = require('sequelize')
const sequelize = require('../../config/db-instance')

const publication = sequelize.define(
  'Publications',
  {
    pub_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    // ── ข้อมูลพื้นฐาน ─────────────────────────────────────────────────────────
    spreadsheet_id: {
      type: Sequelize.STRING(20),
      allowNull: true,   // เช่น "P1", "P2"
    },
    title: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    journal_name: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    publication_year: {
      type: Sequelize.INTEGER,
      allowNull: false,  // CE year เช่น 2025
    },
    quartile: {
      type: Sequelize.STRING,
      allowNull: true,   // Q (Scopus): Q1, Q2, Q3, Q4, Tier 1
    },
    database_source: {
      type: Sequelize.STRING,
      allowNull: true,   // "Scopus", "ISI", "Other"
    },
    // ── ข้อมูลบรรณานุกรม ──────────────────────────────────────────────────────
    doi: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    issn: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    impact_factor: {
      type: Sequelize.FLOAT,
      allowNull: true,
    },
    // ── ฐานข้อมูล / index ──────────────────────────────────────────────────────
    is_scopus: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    is_isi: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    q_scie: {
      type: Sequelize.STRING,
      allowNull: true,   // Q (SCIE): Q1, Q2, Q3, Q4
    },
    // ── ประเภทความร่วมมือ ──────────────────────────────────────────────────────
    collab_type: {
      type: Sequelize.STRING,
      allowNull: true,   // "ไทย" / "ต่างประเทศ"
    },
    is_international: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    // ── อื่นๆ ─────────────────────────────────────────────────────────────────
    photo_url: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: false,
    tableName: 'Publications'
  },
)

;(async () => {
  await publication.sync({ alter: true })
})()

module.exports = publication
