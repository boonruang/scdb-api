const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')

const researchinnovation = sequelize.define(
  'researchinnovations',
  {
    // attributes
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    researchname: {
      type: Sequelize.TEXT,
      allowNull: false,
    },    
    researcher: {
      type: Sequelize.STRING,
      allowNull: false,
    },    
    position: {
      type: Sequelize.STRING,
      allowNull: false,
    },     
    organization: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    herbal: {
      type: Sequelize.STRING,
      allowNull: false,
    },     
    researchtype: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    journal: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    publishyear: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    download: {
      type: Sequelize.STRING,
      allowNull: false,
    },  
    reference: {
      type: Sequelize.STRING,
      allowNull: true,
    },      
    latitude: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    longitude: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },       
    status: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    }      
  },
  {
    timestamps: false,
    tableName: "researchinnovations",
  },
)

;(async () => {
  await researchinnovation.sync({ force: false })
})()

module.exports = researchinnovation
