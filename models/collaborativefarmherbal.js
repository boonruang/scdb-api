const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')
const herbal = require('./herbal')
const collaborativefarm = require('./collaborativefarm')

const collaborativefarmherbal = sequelize.define(
  'collaborativefarmherbals',
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
    tableName: "collaborativefarmherbals",
  },
)


collaborativefarm.belongsToMany(herbal,{
  through: {
    model: "collaborativefarmherbals",
    unique: false
},
  constraints: false 
})

herbal.belongsToMany(collaborativefarm,{
  through: {
    model: "collaborativefarmherbals",
    unique: false
},
  constraints: false 
})


;(async () => {
  await collaborativefarmherbal.sync({ force: false })
})()

module.exports = collaborativefarmherbal
