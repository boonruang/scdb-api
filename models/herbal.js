const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')
const farmer = require('./farmer')

const herbal = sequelize.define(
  'herbals',
  {
    // attributes
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    herbalname: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    commonname: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    scientificname: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    othername: {
      type: Sequelize.TEXT,
      allowNull: false,
    },        
    image : {
      type: Sequelize.STRING,
      allowNull: true,
    },        
    ph : {
      type: Sequelize.STRING,
      allowNull: true,
    },        
    soil : {
      type: Sequelize.STRING,
      allowNull: true,
    },        
    disease : {
      type: Sequelize.TEXT,
      allowNull: true,
    },        
    phstart : {
      type: Sequelize.FLOAT,
      allowNull: true,
    },        
    phend : {
      type: Sequelize.FLOAT,
      allowNull: true,
    },      
    charactername: {
      type: Sequelize.TEXT,
      allowNull: true,
    },       
    propertyname: {
      type: Sequelize.TEXT,
      allowNull: true,
    },       
    benefit: {
      type: Sequelize.TEXT,
      allowNull: true,
    },       
    referencename: {
      type: Sequelize.TEXT,
      allowNull: true,
    },       
    eliminate: {
      type: Sequelize.STRING,
      allowNull: true,
    },       
    pharmacology: {
      type: Sequelize.STRING,
      allowNull: true,
    },       
    nutritive: {
      type: Sequelize.STRING,
      allowNull: true,
    },       
    caution: {
      type: Sequelize.STRING,
      allowNull: true,
    },       
    process: {
      type: Sequelize.STRING,
      allowNull: true,
    },       
    more: {
      type: Sequelize.STRING,
      allowNull: true,
    },       
    instruction: {
      type: Sequelize.STRING,
      allowNull: true,
    },       
    purchasing: {
      type: Sequelize.STRING,
      allowNull: true,
    },       
    quality: {
      type: Sequelize.STRING,
      allowNull: true,
    },       
    harvestperiod: {
      type: Sequelize.STRING,
      allowNull: true,
    },       
    consumption: {
      type: Sequelize.STRING,
      allowNull: true,
    },       
    chemical: {
      type: Sequelize.STRING,
      allowNull: true,
    },       
    clinicaltest: {
      type: Sequelize.STRING,
      allowNull: true,
    },       
    plantrange: {
      type: Sequelize.STRING,
      allowNull: true,
    },  
    harvestrange: {
      type: Sequelize.STRING,
      allowNull: true,
    }, 
    chemotype: {
      type: Sequelize.STRING,
      allowNull: true,
    },       
    basicprocess: {
      type: Sequelize.STRING,
      allowNull: true,
    },       
    rawprice: {
      type: Sequelize.FLOAT,
      allowNull: true,
    },       
    productprice: {
      type: Sequelize.FLOAT,
      allowNull: true,
    },       
    remark: {
      type: Sequelize.STRING,
      allowNull: true,
    },       
    source: {
      type: Sequelize.STRING,
      allowNull: true,
    },       
  },
  {
    timestamps: false,
  },
)

;(async () => {
  await herbal.sync({ force: false })
})()

module.exports = herbal
