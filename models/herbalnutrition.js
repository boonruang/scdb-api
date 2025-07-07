const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')
const herbal = require('./herbal')
const nutrition = require('./nutrition')

const herbalnutrition = sequelize.define(
  'herbalnutrition',
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
    nutritionId: {
        type: Sequelize.INTEGER,
        allowNull: false,      
      },
  },
  {
    timestamps: false,
    tableName: "herbalnutrition",
  },
)

// reference.belongsToMany(herbal,{
//     through: "herbalnutrition",
//   })

// herbal.belongsToMany(reference,{
//   through: "herbalnutrition",
// })

nutrition.belongsToMany(herbal,{
  through: {
    model: "herbalnutrition",
    unique: false
},
  constraints: false 
})

herbal.belongsToMany(nutrition,{
  through: {
    model: "herbalnutrition",
    unique: false
},
  constraints: false 
})

;(async () => {
  await herbalnutrition.sync({ force: false })
})()

module.exports = herbalnutrition
