const Sequelize = require('sequelize')
const sequelize = require('../../config/db-instance')

const AcademicGrant = sequelize.define(
  'AcademicGrants',
  {
    grant_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    student_code: { type: Sequelize.STRING, allowNull: true },
    prefix:       { type: Sequelize.STRING, allowNull: true },
    firstname:    { type: Sequelize.STRING, allowNull: true },
    lastname:     { type: Sequelize.STRING, allowNull: true },
    program:      { type: Sequelize.STRING, allowNull: true },
    major_name:   { type: Sequelize.STRING, allowNull: true },
    topic:           { type: Sequelize.TEXT,    allowNull: true },
    conference_name: { type: Sequelize.TEXT,    allowNull: true },
    present_type:    { type: Sequelize.STRING,  allowNull: true },
    amount:          { type: Sequelize.FLOAT,   allowNull: true },
    grant_type:      { type: Sequelize.STRING,  allowNull: true },
    degree_level:    { type: Sequelize.STRING,  allowNull: true },
    fiscal_year:     { type: Sequelize.INTEGER, allowNull: true },
  },
  {
    timestamps: false,
    tableName: 'AcademicGrants',
  }
)

;(async () => {
  await AcademicGrant.sync({ alter: true })
})()

module.exports = AcademicGrant
