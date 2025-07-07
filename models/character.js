const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')

const character = sequelize.define(
  'character',
  {
    // attributes
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    charactername: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "character",
  },
)

;(async () => {
  await character.sync({ force: false })
})()

module.exports = character
