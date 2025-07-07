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
    reference: {
      type: Sequelize.TEXT,
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
