const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')

const priceday = sequelize.define(
  'pricedays',
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
    unit : {
      type: Sequelize.STRING,
      allowNull: true,
    },        
    price : {
      type: Sequelize.FLOAT,
      allowNull: true,
    },        
    date : {
      type: Sequelize.STRING,
      allowNull: true,
    },        
  },
  {
    timestamps: false,
  },
)

;(async () => {
  await priceday.sync({ force: false })
})()

module.exports = priceday
