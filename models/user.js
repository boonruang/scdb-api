const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')

const user = sequelize.define(
  'users',
  {
    // attributes
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    firstname: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastname: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    status: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    description: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    roleArr : {
      type: Sequelize.VIRTUAL,
      allowNull: true,
      get () {
        const roleData = this.getDataValue('roles')
        return roleData?.map(item => {
          return item.name
        })
      }
    },     
  },
  {
    timestamps: false,
  },
)

;(async () => {
  await user.sync({ force: false })
})()

module.exports = user
