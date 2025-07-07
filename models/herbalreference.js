const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')
const herbal = require('./herbal')
const reference = require('./reference')

const herbalreference = sequelize.define(
  'herbalreference',
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
    referenceId: {
        type: Sequelize.INTEGER,
        allowNull: false,      
      },
  },
  {
    timestamps: false,
    tableName: "herbalreference",
  },
)

// reference.belongsToMany(herbal,{
//     through: "herbalreference",
//   })

// herbal.belongsToMany(reference,{
//   through: "herbalreference",
// })

reference.belongsToMany(herbal,{
  through: {
    model: "herbalreference",
    unique: false
},
  constraints: false 
})

herbal.belongsToMany(reference,{
  through: {
    model: "herbalreference",
    unique: false
},
  constraints: false 
})

;(async () => {
  await herbalreference.sync({ force: false })
})()

module.exports = herbalreference
