const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')

const standardtype = sequelize.define(
  'standardtypes',
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
    tableName: "standardtypes",
  },
)

;(async () => {
  await standardtype.sync({ force: false })
})()

module.exports = standardtype
