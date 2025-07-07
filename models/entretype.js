const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')

const entretype = sequelize.define(
  'entretypes',
  {
    // attributes
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    status: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    }      
  },
  {
    timestamps: false,
    tableName: "entretypes",
  },
)


;(async () => {
  await entretype.sync({ force: false })
})()

module.exports = entretype
