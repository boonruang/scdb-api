const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')

const producttype = sequelize.define(
  'producttypes',
  {
    // attributes
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
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
    tableName: "producttypes",
  },
)

;(async () => {
  await producttype.sync({ force: false })
})()

module.exports = producttype
