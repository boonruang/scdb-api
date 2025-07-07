const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')

const property = sequelize.define(
  'property',
  {
    // attributes
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    propertyname: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "property",
  },
)

;(async () => {
  await property.sync({ force: false })
})()

module.exports = property
