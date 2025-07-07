const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')

const herbalmarketplace = sequelize.define(
  'herbalmarketplaces',
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
    herbals: {
      type: Sequelize.STRING,
      allowNull: true,
    },              
    specification: {
      type: Sequelize.STRING,
      allowNull: true,
    },   
    amount: {
      type: Sequelize.STRING,
      allowNull: true,
    },                
    reference: {
      type: Sequelize.STRING,
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
    timestamps: false
  },
)

;(async () => {
  await herbalmarketplace.sync({ force: false })
})()

module.exports = herbalmarketplace
