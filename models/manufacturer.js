const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')
const ownertype = require('./ownertype')
const producetype = require('../models/producetype')
const producttype = require('../models/producttype')
const standardtype = require('../models/standardtype')
const manufacturer = sequelize.define(
  'manufacturer',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    ownertypeId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },    
    producetypeId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },    
    producttypeId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },    
    standardtypeId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },    
    name: {
      type: Sequelize.TEXT,
      allowNull: true,
    },    
    registrationno: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    standardno: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    hno: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    soi: {
      type: Sequelize.STRING,
      allowNull: true,
    },            
    road: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    moo: {
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
    mophlicenseno: {
      type: Sequelize.STRING,
      allowNull: true,
    },      
    herbal  : {
      type: Sequelize.STRING,
      allowNull: true,
    },
    source  : {
      type: Sequelize.STRING,
      allowNull: true,
    },
    volume  : {
      type: Sequelize.FLOAT,
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
    tableName: "manufacturer",
  },
)

manufacturer.belongsTo(ownertype,{
  foreignKey: 'ownertypeId',
  targetKey: 'id',
  },
)

manufacturer.belongsTo(producetype,{
  foreignKey: 'producetypeId',
  targetKey: 'id',
  },
)

manufacturer.belongsTo(producttype,{
  foreignKey: 'producttypeId',
  targetKey: 'id',
  },
)

manufacturer.belongsTo(standardtype,{
  foreignKey: 'standardtypeId',
  targetKey: 'id',
  },
)

;(async () => {
  await manufacturer.sync({ force: false })
})()

module.exports = manufacturer
