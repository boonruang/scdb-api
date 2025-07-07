const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')

const outsource = sequelize.define(
  'outsources',
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
    hno: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    moo: {
      type: Sequelize.STRING,
      allowNull: false,
    },     
    baan: {
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
    services: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    standard: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    remark: {
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
    timestamps: false,
    tableName: "outsources",
  },
)

;(async () => {
  await outsource.sync({ force: false })
})()

module.exports = outsource
