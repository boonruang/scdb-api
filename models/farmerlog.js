const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')
const farmer = require('./farmer')
const user = require('./user')
const farmerlog = sequelize.define(
  'farmerlogs',
  {
    // attributes
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    farmerId: {
      type: Sequelize.INTEGER,
      allowNull: false,      
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,         
    },    
    action: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    date: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  },
)

farmer.belongsToMany(user,{
  through: {
    model: "farmerlogs",
    unique: false
},
  constraints: false 
})

user.belongsToMany(farmer,{
  through: {
    model: "farmerlogs",
    unique: false
},
  constraints: false 
})

;(async () => {
  await farmerlog.sync({ force: false })
})()

module.exports = farmerlog
