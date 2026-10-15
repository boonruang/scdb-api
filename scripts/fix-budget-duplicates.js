/**
 * fix-budget-duplicates.js
 * ตรวจ (และล้าง) แถวซ้ำใน BudgetPlans / BudgetActivities
 *
 *   node scripts/fix-budget-duplicates.js            ดูอย่างเดียว ไม่แก้อะไร
 *   node scripts/fix-budget-duplicates.js --apply    ลบแถวซ้ำ เก็บ id ต่ำสุดไว้
 *   node scripts/fix-budget-duplicates.js --apply --index   ลบซ้ำ + สร้าง unique index
 *
 * แถวซ้ำมาจาก seed-budget.js ที่ INSERT ทุกแถวในไฟล์ Excel รวมแถวที่รหัสซ้ำกันเอง
 * ตราบใดที่ยังซ้ำ ตัวเลขบน dashboard จะถูกนับซ้ำ
 */

const sequelize = require('../config/db-instance')

const APPLY = process.argv.includes('--apply')
const INDEX = process.argv.includes('--index')

const TARGETS = [
  {
    table: 'BudgetPlans',
    id: 'plan_id',
    keys: ['budget_code', 'fiscal_year'],
    index: 'budgetplans_code_year_uidx',
  },
  {
    table: 'BudgetActivities',
    id: 'activity_id',
    keys: ['budget_code', 'activity_code'],
    index: 'budgetactivities_code_activity_uidx',
  },
]

async function main() {
  await sequelize.authenticate()
  console.log(APPLY ? '=== โหมดแก้ไขจริง ===' : '=== โหมดดูอย่างเดียว (ใส่ --apply เพื่อแก้จริง) ===')

  for (const t of TARGETS) {
    const cols = t.keys.map((k) => `"${k}"`).join(', ')
    // แถวที่ key เป็น NULL ไม่นับว่าซ้ำ (NULL คือ "ไม่รู้" ไม่ใช่ "ค่าเดียวกัน") ตรงกับที่ Postgres มองใน unique index
    const notNull = t.keys.map((k) => `"${k}" IS NOT NULL`).join(' AND ')
    const groups = await sequelize.query(
      `SELECT ${cols}, COUNT(*) AS c, MIN("${t.id}") AS keep_id
         FROM "${t.table}"
        WHERE ${notNull}
        GROUP BY ${cols}
       HAVING COUNT(*) > 1
        ORDER BY c DESC`,
      { type: require('sequelize').QueryTypes.SELECT }
    )

    console.log(`\n${t.table}: กลุ่มที่ซ้ำ ${groups.length} กลุ่ม`)
    let extra = 0
    for (const g of groups) {
      extra += Number(g.c) - 1
      console.log(`  ${t.keys.map((k) => g[k]).join(' / ')}  ->  ${g.c} แถว (เก็บ ${t.id}=${g.keep_id})`)
    }
    if (groups.length === 0) { console.log('  ไม่มีแถวซ้ำ') }
    else console.log(`  แถวที่จะถูกลบทั้งหมด: ${extra}`)

    if (APPLY && groups.length > 0) {
      const match = t.keys.map((k) => `a."${k}" = b."${k}"`).join(' AND ')
      const aNotNull = t.keys.map((k) => `a."${k}" IS NOT NULL`).join(' AND ')
      const [, meta] = await sequelize.query(
        `DELETE FROM "${t.table}" a
          USING "${t.table}" b
          WHERE ${match}
            AND ${aNotNull}
            AND a."${t.id}" > b."${t.id}"`
      )
      console.log(`  ลบแล้ว ${meta.rowCount} แถว`)
    }

    if (APPLY && INDEX) {
      try {
        await sequelize.query(`CREATE UNIQUE INDEX IF NOT EXISTS "${t.index}" ON "${t.table}" (${cols})`)
        console.log(`  สร้าง unique index ${t.index} แล้ว`)
      } catch (e) {
        console.log(`  สร้าง index ไม่สำเร็จ: ${e.message}`)
      }
    }
  }

  await sequelize.close()
}

main().catch((e) => { console.error(e); process.exit(1) })
