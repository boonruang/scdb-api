const Sequelize = require('sequelize')
const sequelize = require('../../config/db-instance')

const Major = sequelize.define(
  'Majors',
  {
    major_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    major_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    department_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: false,
    tableName: 'Majors',
  }
)

;(async () => {
  await Major.sync({ alter: true })
})()

module.exports = Major
