const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')

const knowledgebase = sequelize.define(
  'knowledgebase',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: Sequelize.TEXT,
      allowNull: false,
    },    
    author: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    publishyear: {
      type: Sequelize.STRING,
      allowNull: false,
    },    
    edition: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    journal: {
      type: Sequelize.STRING,
      allowNull: false,
    },    
    press: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    reference: {
      type: Sequelize.STRING,
      allowNull: true,
    },      
    attachment  : {
      type: Sequelize.STRING,
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
    tableName: "knowledgebase",
  },
)

;(async () => {
  await knowledgebase.sync({ force: false })
})()

module.exports = knowledgebase
