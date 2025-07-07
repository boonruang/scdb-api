const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')
const herbal = require('./herbal')
const farmergroup = require('./farmergroup')

const farmergroupherbal = sequelize.define(
  'farmergroupherbals',
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
    herbalId: {
        type: Sequelize.INTEGER,
        allowNull: false,         
    },
    area: {
        type: Sequelize.FLOAT,
        allowNull: true,         
    },
    output: {
        type: Sequelize.FLOAT,
        allowNull: true,         
    },
  },
  {
    timestamps: false,
    tableName: "farmergroupherbals",
  },
)


farmergroup.belongsToMany(herbal,{
  through: {
    model: "farmergroupherbals",
    unique: false
},
  constraints: false 
})

herbal.belongsToMany(farmergroup,{
  through: {
    model: "farmergroupherbals",
    unique: false
},
  constraints: false 
})


;(async () => {
  await farmergroupherbal.sync({ force: false })
})()

module.exports = farmergroupherbal
