const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')

const post = sequelize.define(
  'posts',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    excerpt: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    category: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    date: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    image: {
      type: Sequelize.STRING,
      allowNull: true,
    },    
    views: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },      
  },
  {
    timestamps: false,
  },
)

;(async () => {
  await post.sync({ force: false })
})()

module.exports = post
