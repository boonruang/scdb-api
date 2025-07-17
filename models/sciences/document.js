const Sequelize = require('sequelize')
const sequelize = require('../../config/db-instance')

const document = sequelize.define(
  'Documents',
  {
    doc_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    doc_reference_no: {
      type: Sequelize.STRING,
    },
    date_received: {
      type: Sequelize.DATE,
    },
    doc_from: {
      type: Sequelize.STRING,
    },
    doc_to: {
      type: Sequelize.STRING,
    },
    subject: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    department_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Departments',
        key: 'department_id',
      },
    },
    project_id: {
      type: Sequelize.INTEGER,
      allowNull: true, // A document may not be related to a project
      references: {
        model: 'Projects',
        key: 'project_id',
      },
    },
  },
  {
    timestamps: false,
    tableName: 'Documents'
  },
)

;(async () => {
  await document.sync({ force: false })
})()

module.exports = document