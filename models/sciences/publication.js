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
    },
    publication_year: {
      type: Sequelize.INTEGER,
    },
    quartile: {
      type: Sequelize.STRING,
    },
    database_source: {
      type: Sequelize.STRING,
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