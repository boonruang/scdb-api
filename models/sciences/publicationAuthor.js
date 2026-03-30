const Sequelize = require('sequelize')
const sequelize = require('../../config/db-instance')

const publicationAuthor = sequelize.define(
  'PublicationAuthors',
  {
    pub_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      references: { model: 'Publications', key: 'pub_id' },
    },
    research_author_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      references: { model: 'ResearchAuthors', key: 'research_author_id' },
    },
  },
  {
    timestamps: false,
    tableName: 'PublicationAuthors',
  }
)

;(async () => { await publicationAuthor.sync({ alter: true }) })()

module.exports = publicationAuthor
