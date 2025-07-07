const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')

const collaborativefarm = sequelize.define(
  'collaborativefarms',
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
    leader: {
      type: Sequelize.STRING,
      allowNull: true,
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
    member: {
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
    latitude: {
      type: Sequelize.FLOAT,
      allowNull: true,
    },
    longitude: {
      type: Sequelize.FLOAT,
      allowNull: true,
    },  
    facility: {
      type: Sequelize.TEXT,
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
    tableName: "collaborativefarms",
  },
)

;(async () => {
  await collaborativefarm.sync({ force: false })
})()

module.exports = collaborativefarm
