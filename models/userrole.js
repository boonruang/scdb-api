const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')
const user = require('./user')
const role = require('./role')

const userrole = sequelize.define(
  'userrole',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,         
    },    
    roleId: {
        type: Sequelize.INTEGER,
        allowNull: false,      
      },
    date: {
        type: Sequelize.DATE,
        allowNull: true,      
      },
  },
  {
    timestamps: false,
    tableName: "userroles",
  },
)

user.belongsToMany(role,{
  through: {
    model: "userrole",
    unique: false
},
  constraints: false 
})

role.belongsToMany(user,{
  through: {
    model: "userrole",
    unique: false
},
  constraints: false 
})

;(async () => {
  await userrole.sync({ force: false })
})()

module.exports = userrole
