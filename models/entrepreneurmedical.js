const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')
const servicetype = require('./servicetype')
const ownertype = require('./ownertype')
const entrepreneurmedical = sequelize.define(
  'entrepreneurmedicals',
  {
    // attributes
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    servicetypeId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },    
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },    
    hno: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    moo: {
      type: Sequelize.STRING,
      allowNull: false,
    },     
    tambon: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    amphoe: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    province: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    postcode: {
      type: Sequelize.STRING,
      allowNull: false,
    },        
    ownertypeId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    member: {
      type: Sequelize.STRING,
      allowNull: true,
    },              
    reference: {
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
    status: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    }      
  },
  {
    timestamps: false,
    tableName: "entrepreneurmedicals",
  },
)

entrepreneurmedical.belongsTo(servicetype,{
  foreignKey: 'servicetypeId',
  targetKey: 'id',
  },
)

entrepreneurmedical.belongsTo(ownertype,{
  foreignKey: 'ownertypeId',
  targetKey: 'id',
  },
)

;(async () => {
  await entrepreneurmedical.sync({ force: false })
})()

module.exports = entrepreneurmedical
