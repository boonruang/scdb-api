const Sequelize = require('sequelize')
const sequelize = require('../../config/db-instance')

const Division = sequelize.define(
  'Divisions',
  {
    division_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    division_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: 'Divisions',
  }
)

;(async () => {
  await Division.sync({ alter: true })
})()

module.exports = Division
