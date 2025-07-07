const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance');

const farmergroup = sequelize.define(
  'farmergroup',
  {
    // attributes
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    farmergroupname: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    hno: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    moo: {
      type: Sequelize.STRING,
      allowNull: true,
    },     
    village : {
      type: Sequelize.STRING,
      allowNull: true,
    },       
    tambon: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    amphoe: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    province: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    postcode: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    tel: {
      type: Sequelize.STRING,
      allowNull: true,
    },    
    leader: {
      type: Sequelize.STRING,
      allowNull: true,
    },    
    cert: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    member: {
      type: Sequelize.STRING,
      allowNull: true,
    },  
    latitude: {
      type: Sequelize.FLOAT,
      allowNull: true,
    },
    longitude: {
      type: Sequelize.FLOAT,
      allowNull: true,
    },
    facility: {
      type: Sequelize.TEXT,
      allowNull: true,
    },   
    utility: {
      type: Sequelize.TEXT,
      allowNull: true,
    },      
    status: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },     
  },
  {
    timestamps: false,
    tableName: "farmergroup",
  },
)

// farmergroup.associate = (models) => {
//   farmergroup.belongsToMany(models.herbal,{
//     through: "farmergroupherbals"
//   })
// }
  
;(async () => {
  await farmergroup.sync({ force: false })
})()

module.exports = farmergroup
