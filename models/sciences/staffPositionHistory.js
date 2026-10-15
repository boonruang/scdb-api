const Sequelize = require('sequelize')
const sequelize = require('../../config/db-instance')

// ไม่ใส่ FK constraint ระดับ DB: model แต่ละตัว sync เองแบบไม่รอกัน ถ้าตารางแม่ยังไม่ถูกสร้าง boot แรกจะพัง
// (เหตุผลเดียวกับที่ Staff ถอด FK ออกใน 93162ed) ความถูกต้องของ id ตรวจใน route แทน

// ประวัติการดำรงตำแหน่งทางวิชาการ (อ. → ผศ. → รศ. → ศ.)
// ตำแหน่งปัจจุบันยังอยู่ที่ Staff.title_th ตารางนี้เก็บเส้นทางย้อนหลัง
const staffPositionHistory = sequelize.define(
  'StaffPositionHistory',
  {
    history_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    staff_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    academic_position: {
      type: Sequelize.STRING(50),   // อาจารย์ / ผู้ช่วยศาสตราจารย์ / รองศาสตราจารย์ / ศาสตราจารย์
      allowNull: false,
    },
    field_of_study: {
      type: Sequelize.STRING,       // สาขาวิชาที่ได้รับแต่งตั้ง
      allowNull: true,
    },
    appointed_date: {
      type: Sequelize.DATEONLY,
      allowNull: true,
    },
    order_no: {
      type: Sequelize.STRING(100),  // เลขที่คำสั่งแต่งตั้ง
      allowNull: true,
    },
    note: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: false,
    tableName: 'StaffPositionHistory',
  }
)

;(async () => {
  await staffPositionHistory.sync({ alter: true })
})()

module.exports = staffPositionHistory
