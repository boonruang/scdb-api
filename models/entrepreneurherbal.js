const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')
const entretype = require('../models/entretype')
const producttype = require('../models/producttype')
const entrepreneurherbal = sequelize.define(
  'entrepreneurherbals',
  {
    // attributes
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    entretypeId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },    
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },    
    hno: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    moo: {
      type: Sequelize.STRING,
      allowNull: true,
    },     
    tambon: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    amphoe: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    province: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    postcode: {
      type: Sequelize.STRING,
      allowNull: false,
    },       
    brand: {
      type: Sequelize.STRING,
      allowNull: false,
    },         
    source: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    producttypeId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },                  
    registrationno: {
      type: Sequelize.STRING,
      allowNull: true,
    },              
    herbals: {
      type: Sequelize.STRING,
      allowNull: true,
    },              
    standard: {
      type: Sequelize.STRING,
      allowNull: true,
    },              
    reference: {
      type: Sequelize.TEXT,
      allowNull: true,
    },  
    latitude: {
      type: Sequelize.FLOAT,
      allowNull: true,
    },
    longitude: {
      type: Sequelize.FLOAT,
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
    tableName: "entrepreneurherbals",
  },
)

entrepreneurherbal.belongsTo(entretype,{
  foreignKey: 'entretypeId',
  targetKey: 'id',
  },
)

entrepreneurherbal.belongsTo(producttype,{
  foreignKey: 'producttypeId',
  targetKey: 'id',
  },
)

;(async () => {
  await entrepreneurherbal.sync({ force: false })
})()

module.exports = entrepreneurherbal
