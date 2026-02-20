/**
 * seed-budget.js
 * อ่านข้อมูลจาก ข้อมูลแผนและงบประมาณ.xlsx แล้ว INSERT เข้า DB
 *
 * Sheets:
 *   แผนโครงการ       → BudgetPlans
 *   ขออนุมัติจัดโครงการ → BudgetActivities
 *   เบิกจ่ายงบประมาณ  → BudgetDisbursements
 *
 * รัน: node scripts/seed-budget.js
 */

const path     = require('path')
const XLSX     = require('xlsx')
const sequelize = require('../config/db-instance')

// Load models
const budgetPlanModel         = require('../models/sciences/budgetPlan')
const budgetActivityModel     = require('../models/sciences/budgetActivity')
const budgetDisbursementModel = require('../models/sciences/budgetDisbursement')

const FILE = path.join(__dirname, '../../docs/ข้อมูลแผนและงบประมาณ.xlsx')

// Excel serial date → 'YYYY-MM-DD' string (หรือ null ถ้าไม่มีค่า)
function excelDateToStr(val) {
  if (!val || typeof val !== 'number') return null
  try {
    return XLSX.SSF.format('yyyy-mm-dd', val)
  } catch {
    return null
  }
}

// ดึง fiscal_year จาก budget_code (2 ตัวแรกของตัวเลข + 2500 - 543)
// 6820911055 → '68' → BE 2568 → CE 2025
function fiscalYearFromCode(code) {
  const s = String(code)
  if (s.length < 2) return null
  const be = parseInt('25' + s.substring(0, 2))
  return be - 543  // CE
}

async function main() {
  await sequelize.authenticate()
  console.log('DB connected')

  // รอให้ตารางถูกสร้างก่อน (models ใช้ sync: force:false)
  await budgetPlanModel.sync({ force: false })
  await budgetActivityModel.sync({ force: false })
  await budgetDisbursementModel.sync({ force: false })
  console.log('Tables synced')

  const wb   = XLSX.readFile(FILE)

  // ── Step 1: ล้างข้อมูลเก่า ────────────────────────────────────────────────
  console.log('\nStep 1: ล้างข้อมูลเก่า...')
  await sequelize.query('DELETE FROM "BudgetDisbursements"')
  await sequelize.query('DELETE FROM "BudgetActivities"')
  await sequelize.query('DELETE FROM "BudgetPlans"')
  await sequelize.query('ALTER SEQUENCE "BudgetDisbursements_disbursement_id_seq" RESTART WITH 1')
  await sequelize.query('ALTER SEQUENCE "BudgetActivities_activity_id_seq" RESTART WITH 1')
  await sequelize.query('ALTER SEQUENCE "BudgetPlans_plan_id_seq" RESTART WITH 1')
  console.log('  ล้างข้อมูลเก่าเรียบร้อย')

  // ── Step 2: BudgetPlans จาก sheet แผนโครงการ ─────────────────────────────
  console.log('\nStep 2: INSERT BudgetPlans...')
  const ws1  = wb.Sheets['แผนโครงการ']
  const rows1 = XLSX.utils.sheet_to_json(ws1, { header: 1, defval: '' })
  // row 0 = merged header, row 1 = column names, row 2+ = data
  const planRows = rows1.slice(2).filter(r =>
    r[0] !== '' &&
    r[0] !== 'รหัสงบประมาณ' &&
    r[1] !== '' &&
    String(r[0]) !== '1234567890'  // ข้าม mock
  )

  if (planRows.length === 0) {
    console.log('  ไม่มีข้อมูล BudgetPlans')
  } else {
    const planValues = []
    const planBind   = []
    let pi = 1
    planRows.forEach(r => {
      const budgetCode  = String(r[0])
      const projectName = String(r[1])
      const budgetType  = r[2] || null
      const budgetAmt   = parseFloat(r[3]) || 0
      const planQ1      = parseFloat(r[4]) || 0
      const planQ2      = parseFloat(r[5]) || 0
      const planQ3      = parseFloat(r[6]) || 0
      const planQ4      = parseFloat(r[7]) || 0
      const fiscalYear  = fiscalYearFromCode(r[0])

      planValues.push(`($${pi},$${pi+1},$${pi+2},$${pi+3},$${pi+4},$${pi+5},$${pi+6},$${pi+7},$${pi+8})`)
      planBind.push(budgetCode, projectName, budgetType, budgetAmt, planQ1, planQ2, planQ3, planQ4, fiscalYear)
      pi += 9
    })

    await sequelize.query(
      `INSERT INTO "BudgetPlans"
         (budget_code, project_name, budget_type, budget_amount, plan_q1, plan_q2, plan_q3, plan_q4, fiscal_year)
       VALUES ${planValues.join(',')}`,
      { bind: planBind }
    )
    console.log(`  INSERT ${planRows.length} BudgetPlans`)
  }

  // ── Step 3: BudgetActivities จาก sheet ขออนุมัติจัดโครงการ ──────────────
  console.log('\nStep 3: INSERT BudgetActivities...')
  const ws2   = wb.Sheets['ขออนุมัติจัดโครงการ']
  const rows2 = XLSX.utils.sheet_to_json(ws2, { header: 1, defval: '' })
  // row 0 = merged header, row 1 = column names, row 2+ = data
  // col: 0=budget_code, 1=activity_code, 2=activity_name, 3=budget_requested, 18=start_date, 19=end_date
  const actRows = rows2.slice(2).filter(r =>
    r[0] !== '' &&
    r[0] !== 'รหัสงบประมาณ' &&
    r[2] !== '' &&
    String(r[0]) !== '1234567890'
  )

  if (actRows.length === 0) {
    console.log('  ไม่มีข้อมูล BudgetActivities')
  } else {
    const actValues = []
    const actBind   = []
    let ai = 1
    actRows.forEach(r => {
      const budgetCode      = String(r[0])
      const activityCode    = r[1] ? String(r[1]) : null
      const activityName    = String(r[2])
      const budgetRequested = parseFloat(r[3]) || 0
      const startDate       = excelDateToStr(r[18])
      const endDate         = excelDateToStr(r[19])

      actValues.push(`($${ai},$${ai+1},$${ai+2},$${ai+3},$${ai+4},$${ai+5})`)
      actBind.push(budgetCode, activityCode, activityName, budgetRequested, startDate, endDate)
      ai += 6
    })

    await sequelize.query(
      `INSERT INTO "BudgetActivities"
         (budget_code, activity_code, activity_name, budget_requested, start_date, end_date)
       VALUES ${actValues.join(',')}`,
      { bind: actBind }
    )
    console.log(`  INSERT ${actRows.length} BudgetActivities`)
  }

  // ── Step 4: BudgetDisbursements จาก sheet เบิกจ่ายงบประมาณ ───────────────
  console.log('\nStep 4: INSERT BudgetDisbursements...')
  const ws3   = wb.Sheets['เบิกจ่ายงบประมาณ']
  const rows3 = XLSX.utils.sheet_to_json(ws3, { header: 1, defval: '' })
  // row 0 = merged header, row 1 = col names, row 2+ = data
  // col: 0=activity_code, 1=date(excel serial), 2=disburse_type, 3=amount, 4=note
  const disbRows = rows3.slice(2).filter(r =>
    r[0] !== '' &&
    r[0] !== 'รหัสโครงการ/กิจกรรม (ย่อย)'
  )

  if (disbRows.length === 0) {
    console.log('  ไม่มีข้อมูล BudgetDisbursements (ข้ามได้)')
  } else {
    const disbValues = []
    const disbBind   = []
    let di = 1
    disbRows.forEach(r => {
      const activityCode  = String(r[0])
      const disburseDate  = excelDateToStr(r[1])
      const disburseType  = r[2] ? String(r[2]).trim() : null
      const amount        = parseFloat(r[3]) || 0
      const note          = r[4] ? String(r[4]) : null

      disbValues.push(`($${di},$${di+1},$${di+2},$${di+3},$${di+4})`)
      disbBind.push(activityCode, disburseDate, disburseType, amount, note)
      di += 5
    })

    await sequelize.query(
      `INSERT INTO "BudgetDisbursements"
         (activity_code, disburse_date, disburse_type, amount, note)
       VALUES ${disbValues.join(',')}`,
      { bind: disbBind }
    )
    console.log(`  INSERT ${disbRows.length} BudgetDisbursements`)
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n=== Seed สำเร็จ ===')
  const [p] = await sequelize.query('SELECT COUNT(*) AS cnt FROM "BudgetPlans"',       { type: 'SELECT' })
  const [a] = await sequelize.query('SELECT COUNT(*) AS cnt FROM "BudgetActivities"',  { type: 'SELECT' })
  const [d] = await sequelize.query('SELECT COUNT(*) AS cnt FROM "BudgetDisbursements"', { type: 'SELECT' })
  console.log('BudgetPlans:         ', p.cnt)
  console.log('BudgetActivities:    ', a.cnt)
  console.log('BudgetDisbursements: ', d.cnt)

  process.exit(0)
}

main().catch(e => {
  console.error('Seed failed:', e.message)
  process.exit(1)
})
