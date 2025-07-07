const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')

const priceyear = sequelize.define(
  'priceyears',
  {
    // attributes
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    year: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    product: {
      type: Sequelize.STRING,
      allowNull: false,
    },        
    type : {
      type: Sequelize.STRING,
      allowNull: false,
    },        
    group : {
      type: Sequelize.STRING,
      allowNull: true,
    },        
    unit : {
      type: Sequelize.STRING,
      allowNull: true,
    },        
    lowprice : {
      type: Sequelize.FLOAT,
      allowNull: true,
    },        
    hightprice : {
      type: Sequelize.FLOAT,
      allowNull: true,
    },        
    avgprice : {
      type: Sequelize.FLOAT,
      allowNull: true,
    },
    // for the sake of line chart dashboard
    x : {
      type: Sequelize.VIRTUAL,
      allowNull: true,
      get() {
        return this.getDataValue('year').toString()
      }
    },       
    // for the sake of line chart dashboard 
    y : {
      type: Sequelize.VIRTUAL,
      allowNull: true,
      get() {
        return this.getDataValue('avgprice')
      }
    },        
  },
  {
    timestamps: false,
  },
)

;(async () => {
  await priceyear.sync({ force: false })
})()

module.exports = priceyear
