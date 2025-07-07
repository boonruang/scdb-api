const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')

const register = sequelize.define(
  'registers',
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
      allowNull: true,
    },
    firstname: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastname: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    cid: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    hno: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    moo: {
      type: Sequelize.STRING,
      allowNull: false,
    },            
    tambon: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    amphoe: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    province: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    postcode: {
      type: Sequelize.STRING,
      allowNull: false,
    },    
    tel: {
      type: Sequelize.STRING,
      allowNull: true,
    },    
    cert: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    cert_date: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    cert_expire_date: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    latitude: {
      type: Sequelize.FLOAT,
      allowNull: true,
    },
    longitude: {
      type: Sequelize.FLOAT,
      allowNull: true,
    },    
    status: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },   
    reset: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },       
    reject: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },   
    register_type: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },  
    farmergroupId: {
      type: Sequelize.STRING,
      allowNull: true,
    },   
    collaborativefarmId: {
      type: Sequelize.STRING,
      allowNull: true,
    },         
    entrepreneurherbalId: {
      type: Sequelize.STRING,
      allowNull: true,
    },         
    entrepreneurtraditionalmedicineId: {
      type: Sequelize.STRING,
      allowNull: true,
    },         
    // farmer_type: {
    //   type: Sequelize.INTEGER,
    //   defaultValue: 1,
    //   allowNull: false,
    // },     
    // entrepreneur_type: {
    //   type: Sequelize.INTEGER,
    //   defaultValue: 1,
    //   allowNull: false,
    // },
    // register_data: {
    //   type: Sequelize.STRING,
    //   allowNull: true,
    // },         
    // farmer_data: {
    //   type: Sequelize.STRING,
    //   allowNull: true,
    // }, 
    // farmer_group: {
    //   type: Sequelize.STRING,
    //   allowNull: true,
    // }, 
    // entrepreneurherbal_data: {
    //   type: Sequelize.STRING,
    //   allowNull: true,
    // },       
    // entrepreneurtraditionalmedicine_data: {
    //   type: Sequelize.STRING,
    //   allowNull: true,
    // },       
  },
  {
    timestamps: false,
    tableName: "registers",
  },
)

;(async () => {
  await register.sync({ force: false })
})()

module.exports = register
