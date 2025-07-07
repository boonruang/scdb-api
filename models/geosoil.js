const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')

const geosoil = sequelize.define(
  'geosoils',
  {
    // attributes
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    _geojson: {
      type: Sequelize.JSON,
      allowNull: false,
    },
    objectid: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lul1_code: {
      type: Sequelize.STRING,
      allowNull: false,
    },    
    lul2_code: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lu_code: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lu_des_th: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lu_des_en: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    dhape_leng: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    shape_length: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    shape_area: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    status: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    //option
  },
)

;(async () => {
  await geosoil.sync({ force: false })
})()

module.exports = geosoil
