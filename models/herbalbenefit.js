const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')
const herbal = require('./herbal')
const benefit = require('./benefit')

const herbalbenefit = sequelize.define(
  'herbalbenefit',
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
    benefitId: {
        type: Sequelize.INTEGER,
        allowNull: false,      
      },
  },
  {
    timestamps: false,
    tableName: "herbalbenefit",
  },
)

// benefit.belongsToMany(herbal,{
//     through: "herbalbenefit",
//   })

// herbal.belongsToMany(benefit,{
//   through: "herbalbenefit",
// })

benefit.belongsToMany(herbal,{
  through: {
    model: "herbalbenefit",
    unique: false
},
  constraints: false 
})

herbal.belongsToMany(benefit,{
  through: {
    model: "herbalbenefit",
    unique: false
},
  constraints: false 
})

;(async () => {
  await herbalbenefit.sync({ force: false })
})()

module.exports = herbalbenefit
