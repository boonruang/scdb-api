const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')
const herbal = require('./herbal')
const farmer = require('./farmer')

const herbalfarmer = sequelize.define(
  'herbalfarmers',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    herbalId: {
      type: Sequelize.INTEGER,
      allowNull: false,         
    },    
    farmerId: {
        type: Sequelize.INTEGER,
        allowNull: false,      
      },
  },
  {
    timestamps: false,
    tableName: "herbalfarmer",
  },
)

farmer.belongsToMany(herbal,{
  through: {
    model: "herbalfarmers",
    unique: false
},
  constraints: false 
})

herbal.belongsToMany(farmer,{
  through: {
    model: "herbalfarmers",
    unique: false
},
  constraints: false 
})

;(async () => {
  await herbalfarmer.sync({ force: false })
})()

module.exports = herbalfarmer
