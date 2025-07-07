const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')

const nutrition = sequelize.define(
  'nutrition',
  {
    // attributes
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    nutritionname: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "nutrition",
  },
)

;(async () => {
  await nutrition.sync({ force: false })
})()

module.exports = nutrition
