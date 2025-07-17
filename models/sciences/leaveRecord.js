const Sequelize = require('sequelize')
const sequelize = require('../../config/db-instance')

const leaveRecord = sequelize.define(
  'LeaveRecords',
  {
    leave_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    staff_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Staff',
        key: 'staff_id',
      },
    },
    leave_type: {
      type: Sequelize.STRING,
    },
    start_date: {
      type: Sequelize.DATE,
    },
    end_date: {
      type: Sequelize.DATE,
    },
  },
  {
    timestamps: false,
    tableName: 'LeaveRecords'
  },
)

;(async () => {
  await leaveRecord.sync({ force: false })
})()

module.exports = leaveRecord