const Sequelize = require('sequelize')
const sequelize = require('../../config/db-instance')

const stafftype = sequelize.define(
  'Stafftype',
  {
    stafftype_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },

  },
  {
    timestamps: false,
    tableName: 'Stafftype'
  },
)

;(async () => {
  await stafftype.sync({ force: false })
})()

module.exports = stafftype