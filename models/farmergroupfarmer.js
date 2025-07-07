const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')
const farmer = require('./farmer')
const farmergroup = require('./farmergroup')

const farmergroupfarmer = sequelize.define(
  'farmergroupfarmers',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    farmergroupId: {
        type: Sequelize.INTEGER,
        allowNull: false,      
      },
    farmerId: {
        type: Sequelize.INTEGER,
        allowNull: false,         
      },
    date: {
        type: Sequelize.DATE,
        allowNull: true,         
      },
  },
  {
    timestamps: false,
    tableName: "farmergroupfarmers",
  },
)

farmergroup.belongsToMany(farmer,{
  through: {
    model: "farmergroupfarmers",
    unique: false
},
  constraints: false 
})

farmer.belongsToMany(farmergroup,{
  through: {
    model: "farmergroupfarmers",
    unique: false
},
  constraints: false 
})


;(async () => {
  await farmergroupfarmer.sync({ force: false })
})()

module.exports = farmergroupfarmer
