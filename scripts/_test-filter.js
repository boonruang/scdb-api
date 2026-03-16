const sequelize = require('../config/db-instance')
async function test() {
  await sequelize.authenticate()

  // ทดสอบ filter position + dept
  const [r] = await sequelize.query(
    `SELECT COUNT(*) AS cnt FROM "Staff" s
     JOIN "Departments" d ON s.department_id = d.department_id
     WHERE s.stafftype_id=1 AND s.position=$1 AND d.dept_name=$2`,
    { bind: ['รองศาสตราจารย์', 'ภาควิชาชีววิทยา'] }
  )
  console.log('รศ. ชีววิทยา count:', r[0].cnt)

  // ทดสอบ search
  const [r2] = await sequelize.query(
    `SELECT staff_id, firstname_th, lastname_th, position FROM "Staff"
     WHERE stafftype_id=1 AND firstname_th ILIKE $1 LIMIT 3`,
    { bind: ['%พรทิพย์%'] }
  )
  console.log('search พรทิพย์:', r2)

  // login test — ดู user ใน db
  const [users] = await sequelize.query('SELECT id, username, status FROM "Users" LIMIT 3')
  console.log('users:', users)

  process.exit(0)
}
test().catch(e => { console.error(e.message); process.exit(1) })
