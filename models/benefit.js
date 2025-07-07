const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')

const benefit = sequelize.define(
  'benefit',
  {
    // attributes
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    benefitname: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "benefit",
  },
)

;(async () => {
  await benefit.sync({ force: false })
})()

module.exports = benefit
