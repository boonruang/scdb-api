const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')
const herbal = require('./herbal')
const character = require('./character')

const herbalcharacter = sequelize.define(
  'herbalcharacter',
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
    characterId: {
        type: Sequelize.INTEGER,
        allowNull: false,      
      },
  },
  {
    timestamps: false,
    tableName: "herbalcharacter",
  },
)

// character.belongsToMany(herbal,{
//     through: "herbalcharacter",
//   })

// herbal.belongsToMany(character,{
//   through: "herbalcharacter",
// })

character.belongsToMany(herbal,{
  through: {
    model: "herbalcharacter",
    unique: false
},
  constraints: false 
})

herbal.belongsToMany(character,{
  through: {
    model: "herbalcharacter",
    unique: false
},
  constraints: false 
})

;(async () => {
  await herbalcharacter.sync({ force: false })
})()

module.exports = herbalcharacter
