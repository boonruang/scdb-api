const Sequelize = require('sequelize')
const sequelize = require('../../config/db-instance')

const studentGrant = sequelize.define(
  'StudentGrants',
  {
    grant_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    student_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Students',
        key: 'student_id',
      },
    },
    grant_name: {
      type: Sequelize.STRING,
    },
    conference_name: {
      type: Sequelize.STRING,
    },
    amount: {
      type: Sequelize.FLOAT,
    },
  },
  {
    timestamps: false,
    tableName: 'StudentGrants'
  },
)

;(async () => {
  await studentGrant.sync({ force: false })
})()

module.exports = studentGrant