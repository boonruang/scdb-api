const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')

const log = sequelize.define(
  'logs',
  {
    // attributes
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    user: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    method: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    path: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    return: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    date: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  },
)

;(async () => {
  await log.sync({ force: false })
})()

module.exports = log
