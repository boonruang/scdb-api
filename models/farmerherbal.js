const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')
const herbal = require('./herbal')
const farmer = require('./farmer')

const farmerherbal = sequelize.define(
  'farmerherbals',
  {
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
    herbalId: {
        type: Sequelize.INTEGER,
        allowNull: false,         
      },
    area: {
        type: Sequelize.FLOAT,
        allowNull: false,         
    },      
    output: {
        type: Sequelize.FLOAT,
        allowNull: false,         
    },      
  },
  {
    timestamps: false,
    tableName: "farmerherbals",
  },
)

farmer.belongsToMany(herbal,{
  through: {
    model: "farmerherbals",
    unique: true,
    as: 'planter'
},
  constraints: false 
})

herbal.belongsToMany(farmer,{
  through: {
    model: "farmerherbals",
    unique: false
},
  constraints: false 
})


// This work the same.
// farmergroup.belongsToMany(herbal,{
//     through: "farmerherbals",
//     foreignKey: { name: 'farmergroupId', allowNull: false}
//   })

// herbal.belongsToMany(farmergroup,{
//   through: "farmerherbals",
//   foreignKey: { name: 'herbalId', allowNull: false}
// })

// This idea not working
// farmerherbal.associate = () => {
//   herbal.belongsToMany(farmergroup,{
//     through: "farmerherbals"
//   })
//   farmergroup.belongsToMany(herbal,{
//     through: "farmerherbals"
//   })
// }

;(async () => {
  await farmerherbal.sync({ force: false })
})()

module.exports = farmerherbal
