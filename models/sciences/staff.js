const Sequelize = require('sequelize')
const sequelize = require('../../config/db-instance')

const staff = sequelize.define(
  'Staff',
  {
    staff_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
    position: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    education: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    startdate: {
      type: Sequelize.DATE,
      allowNull: true,
    },    
    position_no: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },        
    birthday: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    department_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Departments',
        key: 'department_id',
      },
    },
    stafftype_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Stafftype',
        key: 'stafftype_id',
      },
    },
    email: {
      type: Sequelize.STRING,
      allowNull: true,
    },    
    office_location: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    phone_no: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: false,
    tableName: 'Staff'
  },
)

;(async () => {
  await staff.sync({ force: false })
})()

module.exports = staff