const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')
const farmer = require('./farmer')
const collaborativefarm = require('./collaborativefarm')

const collaborativefarmfarmer = sequelize.define(
  'collaborativefarmfarmers',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    collaborativefarmId: {
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
    tableName: "collaborativefarmfarmers",
  },
)

collaborativefarm.belongsToMany(farmer,{
  through: {
    model: "collaborativefarmfarmers",
    unique: false
},
  constraints: false 
})

farmer.belongsToMany(collaborativefarm,{
  through: {
    model: "collaborativefarmfarmers",
    unique: false
},
  constraints: false 
})


;(async () => {
  await collaborativefarmfarmer.sync({ force: false })
})()

module.exports = collaborativefarmfarmer
