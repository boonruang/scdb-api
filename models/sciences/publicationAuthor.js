const Sequelize = require('sequelize')
const sequelize = require('../../config/db-instance')

const publicationAuthor = sequelize.define(
  'PublicationAuthors',
  {
    pub_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      references: {
        model: 'Publications',
        key: 'pub_id',
      },
    },
    staff_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      references: {
        model: 'Staff',
        key: 'staff_id',
      },
    },
  },
  {
    timestamps: false,
    tableName: 'PublicationAuthors'
  },
)

;(async () => {
  await publicationAuthor.sync({ force: false })
})()

module.exports = publicationAuthor