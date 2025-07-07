const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')
const herbal = require('./herbal')
const property = require('./property')

const herbalproperty = sequelize.define(
  'herbalproperty',
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
    propertyId: {
        type: Sequelize.INTEGER,
        allowNull: false,      
      },
  },
  {
    timestamps: false,
    tableName: "herbalproperty",
  },
)

// property.belongsToMany(herbal,{
//     through: "herbalproperty",
//   })

// herbal.belongsToMany(property,{
//   through: "herbalproperty",
// })

property.belongsToMany(herbal,{
  through: {
    model: "herbalproperty",
    unique: false
},
  constraints: false 
})

herbal.belongsToMany(property,{
  through: {
    model: "herbalproperty",
    unique: false
},
  constraints: false 
})

;(async () => {
  await herbalproperty.sync({ force: false })
})()

module.exports = herbalproperty
