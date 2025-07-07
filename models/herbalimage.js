const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')
const herbal = require('./herbal')

const herbalimage = sequelize.define(
  'herbalimage',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    herbalId: {
      type: Sequelize.INTEGER,
      allowNull: false,         
    },    
    image: {
      type: Sequelize.STRING,
      allowNull: false,      
    },
  },
  {
    timestamps: false,
    tableName: "herbalimage",
  },
)

// ความสัมพันธ์แบบ 1:M
herbal.hasMany(herbalimage, { foreignKey: 'herbalId' });
herbalimage.belongsTo(herbal, { foreignKey: 'herbalId' });

;(async () => {
  await herbalimage.sync({ force: false })
})()

module.exports = herbalimage



