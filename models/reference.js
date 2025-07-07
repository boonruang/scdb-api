const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')

const reference = sequelize.define(
  'reference',
  {
    // attributes
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    referencename: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "reference",
  },
)

;(async () => {
  await reference.sync({ force: false })
})()

module.exports = reference
