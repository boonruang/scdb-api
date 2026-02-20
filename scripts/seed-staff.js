/**
 * seed-staff.js
 * UPSERT ข้อมูลบุคลากรจาก ข้อมูลฝ่ายบุคลากรและวิเทศสัมพันธ์.xlsx
 *
 * Logic:
 *   - Match ด้วย firstname (ENG) + lastname (ENG) (case-insensitive)
 *   - พบ → UPDATE เติม title_th, firstname_th, lastname_th, position_no,
 *             education, startdate, birthday, email, phone_no, department_id, stafftype_id
 *   - ไม่พบ → INSERT แถวใหม่
 *
 * รัน: node scripts/seed-staff.js
 */

const path      = require('path')
const XLSX      = require('xlsx')
const sequelize = require('../config/db-instance')
const staffModel = require('../models/sciences/staff')

const FILE = path.join(__dirname, '../../docs/ข้อมูลฝ่ายบุคลากรและวิเทศสัมพันธ์.xlsx')

// department name → department_id
const DEPT_MAP = {
  'ภาควิชาคณิตศาสตร์': 3,
  'ภาควิชาฟิสิกส์':    2,
  'ภาควิชาชีววิทยา':   3,
  'ภาควิชาเคมี':       4,
}

// stafftype name → stafftype_id
const TYPE_MAP = {
  'อาจารย์':      1,
  'สายสนับสนุน':  2,
}

function excelDateToStr(val) {
  if (!val || typeof val !== 'number') return null
  try { return XLSX.SSF.format('yyyy-mm-dd', val) } catch { return null }
}

async function main() {
  await sequelize.authenticate()
  console.log('DB connected')

  // sync ตาราง Staff (เพื่อให้ column ใหม่ถูกสร้าง)
  await staffModel.sync({ force: false })
  console.log('Staff table synced')

  // ADD COLUMN ใหม่ถ้ายังไม่มี (idempotent)
  const newCols = [
    'ALTER TABLE "Staff" ADD COLUMN IF NOT EXISTS "title_th" VARCHAR(20)',
    'ALTER TABLE "Staff" ADD COLUMN IF NOT EXISTS "firstname_th" VARCHAR(255)',
    'ALTER TABLE "Staff" ADD COLUMN IF NOT EXISTS "lastname_th" VARCHAR(255)',
  ]
  for (const sql of newCols) {
    await sequelize.query(sql)
  }
  console.log('Columns ensured')

  // อ่าน Excel
  const wb   = XLSX.readFile(FILE)
  const ws   = wb.Sheets['ข้อมูลบุคคลากร']
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
  // row 0 = merged header, row 1 = column names, row 2+ = data
  // cols: 0=เลขประจำตำแหน่ง, 1=สถานะ, 2=คำนำหน้า, 3=ชื่อTH, 4=สกุลTH,
  //       5=ชื่อENG, 6=สกุลENG, 7=ตำแหน่ง, 8=วุฒิ, 9=วันบรรจุ, 10=วันเกิด,
  //       11=สังกัด, 12=email, 13=โทรศัพท์, 14=หมายเหตุ
  const data = rows.slice(2).filter(r => r[0] !== '' && r[1] !== '')
  console.log(`\nExcel rows: ${data.length}`)

  // โหลด Staff ที่มีอยู่ใน DB ทั้งหมด → map ด้วย "firstname|lastname" lowercase
  const existing = await sequelize.query(
    'SELECT staff_id, firstname, lastname FROM "Staff"',
    { type: 'SELECT' }
  )
  const existingMap = {}
  existing.forEach(s => {
    const key = `${(s.firstname || '').trim().toLowerCase()}|${(s.lastname || '').trim().toLowerCase()}`
    existingMap[key] = s.staff_id
  })
  console.log(`Existing staff in DB: ${existing.length}`)

  // ดึง dept map จาก DB
  const deptRows = await sequelize.query(
    'SELECT department_id, dept_name FROM "Departments"',
    { type: 'SELECT' }
  )
  const deptMap = {}
  deptRows.forEach(d => { deptMap[d.dept_name] = d.department_id })

  let updated = 0
  let inserted = 0
  let skipped = 0

  for (const r of data) {
    const positionCode = r[0] ? String(r[0]).trim() : null
    const statusTh     = String(r[1]).trim()
    const titleTh      = String(r[2]).trim() || null
    const firstnameTh  = String(r[3]).trim() || null
    const lastnameTh   = String(r[4]).trim() || null
    const firstnameEng = String(r[5]).trim() || null
    const lastnameEng  = String(r[6]).trim() || null
    const position     = String(r[7]).trim() || null
    const education    = String(r[8]).trim() || null
    const startDate    = excelDateToStr(r[9])
    const birthDate    = excelDateToStr(r[10])
    const deptName     = String(r[11]).trim() || null
    const email        = String(r[12]).trim() || null
    const phoneNo      = String(r[13]).trim() || null

    const stafftypeId  = TYPE_MAP[statusTh] || null
    const departmentId = deptName ? (deptMap[deptName] || null) : null

    // ต้องมี firstname ENG เพื่อ match
    if (!firstnameEng || !lastnameEng) {
      // ถ้าไม่มี ENG name เลย ข้ามไป (match ไม่ได้)
      skipped++
      continue
    }

    const matchKey = `${firstnameEng.toLowerCase()}|${lastnameEng.toLowerCase()}`
    const existingId = existingMap[matchKey]

    if (existingId) {
      // UPDATE
      await sequelize.query(
        `UPDATE "Staff" SET
           title_th      = COALESCE($1, title_th),
           firstname_th  = COALESCE($2, firstname_th),
           lastname_th   = COALESCE($3, lastname_th),
           position      = COALESCE($4, position),
           education     = COALESCE($5, education),
           startdate     = COALESCE($6::date, startdate),
           birthday      = COALESCE($7::date, birthday),
           email         = COALESCE($8, email),
           phone_no      = COALESCE($9, phone_no),
           department_id = COALESCE($10, department_id),
           stafftype_id  = COALESCE($11, stafftype_id),
           position_no   = COALESCE($12::integer, position_no)
         WHERE staff_id = $13`,
        { bind: [titleTh, firstnameTh, lastnameTh, position, education,
                 startDate, birthDate, email, phoneNo,
                 departmentId, stafftypeId,
                 positionCode ? parseInt(positionCode) : null,
                 existingId] }
      )
      updated++
    } else {
      // INSERT ใหม่
      await sequelize.query(
        `INSERT INTO "Staff"
           (title_th, firstname_th, lastname_th, firstname, lastname,
            position, education, startdate, birthday,
            email, phone_no, department_id, stafftype_id, position_no)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8::date,$9::date,$10,$11,$12,$13,$14::integer)`,
        { bind: [titleTh, firstnameTh, lastnameTh, firstnameEng, lastnameEng,
                 position, education, startDate, birthDate,
                 email, phoneNo, departmentId, stafftypeId,
                 positionCode ? parseInt(positionCode) : null] }
      )
      inserted++
      // เพิ่มเข้า map เพื่อกัน duplicate ในไฟล์เดียวกัน
      existingMap[matchKey] = -1
    }
  }

  console.log('\n=== Seed staff สำเร็จ ===')
  console.log('Updated:', updated)
  console.log('Inserted:', inserted)
  console.log('Skipped (no ENG name):', skipped)

  const [total] = await sequelize.query('SELECT COUNT(*) AS cnt FROM "Staff"', { type: 'SELECT' })
  console.log('Staff total in DB:', total.cnt)

  process.exit(0)
}

main().catch(e => {
  console.error('Seed failed:', e.message)
  process.exit(1)
})
