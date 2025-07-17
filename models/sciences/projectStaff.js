const Sequelize = require('sequelize')
const sequelize = require('../../config/db-instance')

const projectStaff = sequelize.define(
  'ProjectStaff',
  {
    project_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      references: {
        model: 'Projects',
        key: 'project_id',
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
    tableName: 'ProjectStaff'
  },
)

;(async () => {
  await projectStaff.sync({ force: false })
})()

module.exports = projectStaff