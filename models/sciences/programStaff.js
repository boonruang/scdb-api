const Sequelize = require('sequelize')
const sequelize = require('../../config/db-instance')

// ไม่ใส่ FK constraint ระดับ DB: model แต่ละตัว sync เองแบบไม่รอกัน ถ้าตารางแม่ยังไม่ถูกสร้าง boot แรกจะพัง
// (เหตุผลเดียวกับที่ Staff ถอด FK ออกใน 93162ed) ความถูกต้องของ id ตรวจใน route แทน

// บุคลากรในหลักสูตร พร้อมบทบาท คนเดียวอยู่ได้หลายหลักสูตร หลายบทบาท
const PROGRAM_ROLES = ['ผู้รับผิดชอบหลักสูตร', 'อาจารย์ประจำหลักสูตร', 'อาจารย์ผู้สอน']

const programStaff = sequelize.define(
  'ProgramStaff',
  {
    program_staff_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    program_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    staff_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    role: {
      type: Sequelize.STRING(50),
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: 'ProgramStaff',
    indexes: [{ unique: true, fields: ['program_id', 'staff_id', 'role'] }],
  }
)

;(async () => {
  await programStaff.sync({ alter: true })
})()

module.exports = programStaff
module.exports.PROGRAM_ROLES = PROGRAM_ROLES
