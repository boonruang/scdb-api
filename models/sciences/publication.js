const Sequelize = require('sequelize')
const sequelize = require('../../config/db-instance')

const publication = sequelize.define(
  'Publications',
  {
    pub_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    journal_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    publication_year: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    quartile: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    database_source: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: 'Publications'
  },
)

;(async () => {
  await publication.sync({ force: false })
})()

module.exports = publication