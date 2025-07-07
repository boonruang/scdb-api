const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance');
const farmergroup = require('./farmergroup');
const collaborativefarm = require('./collaborativefarm');

const farmer = sequelize.define(
  'farmers',
  {
    // attributes
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    firstname: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastname: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    cid: {
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
      allowNull: true,
    },    
    tel: {
      type: Sequelize.STRING,
      allowNull: true,
    },    
    cert: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    cert_date: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    cert_expire_date: {
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
    passwordupdate: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    selfregister: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    status: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    other: {
      type: Sequelize.STRING,
      allowNull: true,
    },    
  },
  {
    timestamps: false,
    tableName: "farmers",
  }
)

;(async () => {
  await farmer.sync({ force: false })
})()

module.exports = farmer
