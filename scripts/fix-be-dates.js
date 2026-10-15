// ซ่อมวันที่ที่ถูกเก็บเป็นปี พ.ศ. ในคอลัมน์วันที่ (เช่น 2537-10-17 ที่ควรเป็น 1994-10-17)
// ต้นเหตุ: utils/dateUtils.js excelDateToISO ไม่ลบ 543 เมื่อ Excel ส่งวันที่มาเป็นตัวเลข serial (แก้แล้ว)
//
// ไล่ทุกคอลัมน์ชนิด date/timestamp ในฐาน แก้เฉพาะแถวที่ปี > 2400 จึงรันซ้ำได้ ไม่แก้ซ้ำสอง
// ใช้:  node scripts/fix-be-dates.js          ดูอย่างเดียว (dry run)
//       node scripts/fix-be-dates.js --apply  แก้จริง (ทำใน transaction เดียว)
// ควร pg_dump ก่อน --apply ทุกครั้ง
require('dotenv').config()
const sequelize = require('../config/db-instance')
const { QueryTypes } = require('sequelize')

const apply = process.argv.includes('--apply')

;(async () => {
  const cols = await sequelize.query(
    `SELECT table_name, column_name FROM information_schema.columns
     WHERE table_schema = 'public'
       AND data_type IN ('date', 'timestamp with time zone', 'timestamp without time zone')`,
    { type: QueryTypes.SELECT }
  )
  const found = []
  for (const { table_name: t, column_name: c } of cols) {
    const [{ n }] = await sequelize.query(
      `SELECT COUNT(*)::int AS n FROM "${t}" WHERE EXTRACT(YEAR FROM "${c}") > 2400`,
      { type: QueryTypes.SELECT }
    )
    if (n > 0) found.push({ t, c, n })
  }
  if (!found.length) { console.log('ไม่พบวันที่ปี พ.ศ. ในฐาน'); process.exit(0) }
  found.forEach((f) => console.log(`${f.t}.${f.c}: ${f.n} แถว`))

  if (!apply) { console.log('\n(dry run) ใส่ --apply เพื่อแก้จริง'); process.exit(0) }
  await sequelize.transaction(async (transaction) => {
    for (const { t, c } of found) {
      await sequelize.query(
        `UPDATE "${t}" SET "${c}" = "${c}" - INTERVAL '543 years' WHERE EXTRACT(YEAR FROM "${c}") > 2400`,
        { transaction }
      )
    }
  })
  console.log('\nแก้แล้ว')
  process.exit(0)
})().catch((e) => { console.error(e); process.exit(1) })
