const express  = require('express')
const Sequelize = require('sequelize')
const sequelize = require('../../config/db-instance')
const Op        = Sequelize.Op

// Load models (trigger sync)
require('../../models/sciences/budgetPlan')
require('../../models/sciences/budgetActivity')
require('../../models/sciences/budgetDisbursement')

const router = express.Router()

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function currentBeYear() {
  return new Date().getFullYear() + 543
}

function toCe(beYear) {
  return beYear - 543
}

// ---------------------------------------------------------------------------
// GET /api/v2/dashboard/budget/summary
//
// Query params:
//   fiscalYear  number  optional  ปีงบประมาณ (พ.ศ.) เช่น 2568
// ---------------------------------------------------------------------------
router.get('/summary', async (req, res) => {
  try {
    const fiscalYear = parseInt(req.query.fiscalYear) || currentBeYear()
    const ceYear     = toCe(fiscalYear)

    // นับโครงการและงบรวมจาก BudgetPlans ตาม fiscal_year
    const summaryResult = await sequelize.query(
      `SELECT
         COUNT(*)                    AS total_projects,
         COALESCE(SUM(budget_amount),0) AS total_budget,
         COALESCE(SUM(plan_q1),0)    AS total_q1,
         COALESCE(SUM(plan_q2),0)    AS total_q2,
         COALESCE(SUM(plan_q3),0)    AS total_q3,
         COALESCE(SUM(plan_q4),0)    AS total_q4
       FROM "BudgetPlans"
       WHERE fiscal_year = :ceYear`,
      { replacements: { ceYear }, type: Sequelize.QueryTypes.SELECT }
    )
    const s = summaryResult[0]

    // รวมยอดผูกพัน (committed) และจ่ายจริง (disbursed) จาก BudgetDisbursements
    // join ผ่าน BudgetActivities → BudgetPlans.fiscal_year
    const disbResult = await sequelize.query(
      `SELECT
         bd.disburse_type,
         COALESCE(SUM(bd.amount),0) AS total
       FROM "BudgetDisbursements" bd
       JOIN "BudgetActivities" ba ON bd.activity_code = ba.activity_code
       JOIN "BudgetPlans" bp      ON ba.budget_code   = bp.budget_code
       WHERE bp.fiscal_year = :ceYear
       GROUP BY bd.disburse_type`,
      { replacements: { ceYear }, type: Sequelize.QueryTypes.SELECT }
    )

    let totalDisbursed = 0
    let totalCommitted = 0
    disbResult.forEach(r => {
      const t = r.disburse_type ? r.disburse_type.trim() : ''
      if (t.startsWith('2')) totalDisbursed += parseFloat(r.total)
      else if (t.startsWith('1')) totalCommitted += parseFloat(r.total)
    })

    res.json({
      result: {
        fiscalYear,
        kpi: {
          totalProjects:  parseInt(s.total_projects) || 0,
          totalBudget:    parseFloat(s.total_budget) || 0,
          totalDisbursed: Math.round(totalDisbursed),
          totalCommitted: Math.round(totalCommitted),
        },
        byQuarter: {
          q1: parseFloat(s.total_q1) || 0,
          q2: parseFloat(s.total_q2) || 0,
          q3: parseFloat(s.total_q3) || 0,
          q4: parseFloat(s.total_q4) || 0,
        }
      }
    })

  } catch (error) {
    res.status(500).json({ error: true, message: error.toString() })
  }
})

// ---------------------------------------------------------------------------
// GET /api/v2/dashboard/budget/projects
//
// Query params:
//   fiscalYear  number   optional
//   search      string   optional  ค้นหาจากชื่อโครงการ (ILIKE)
//   budgetType  string   optional  filter หมวดงบ เช่น '1.หมวดงบแผ่นดิน'
//   page        number   optional  default 1
//   limit       number   optional  default 10, max 100
// ---------------------------------------------------------------------------
router.get('/projects', async (req, res) => {
  try {
    const fiscalYear  = parseInt(req.query.fiscalYear) || currentBeYear()
    const ceYear      = toCe(fiscalYear)
    const search      = (req.query.search     || '').trim()
    const budgetType  = (req.query.budgetType || '').trim()
    const page        = Math.max(1, parseInt(req.query.page)  || 1)
    const limit       = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10))
    const offset      = (page - 1) * limit

    const conditions   = ['bp.fiscal_year = :ceYear']
    const replacements = { ceYear, limit, offset }

    if (search) {
      replacements.search = `%${search}%`
      conditions.push('bp.project_name ILIKE :search')
    }
    if (budgetType) {
      replacements.budgetType = budgetType
      conditions.push('bp.budget_type = :budgetType')
    }

    const whereClause = conditions.join(' AND ')

    // Total count
    const countResult = await sequelize.query(
      `SELECT COUNT(*) AS cnt FROM "BudgetPlans" bp WHERE ${whereClause}`,
      { replacements, type: Sequelize.QueryTypes.SELECT }
    )
    const total = parseInt(countResult[0].cnt) || 0

    // Paginated list
    const planRows = await sequelize.query(
      `SELECT bp.plan_id, bp.budget_code, bp.project_name, bp.budget_type,
              bp.budget_amount, bp.plan_q1, bp.plan_q2, bp.plan_q3, bp.plan_q4,
              -- นับกิจกรรมย่อย
              COUNT(DISTINCT ba.activity_id) AS activity_count,
              -- รวมงบที่ขอจากกิจกรรม
              COALESCE(SUM(ba.budget_requested),0) AS total_requested
       FROM "BudgetPlans" bp
       LEFT JOIN "BudgetActivities" ba ON bp.budget_code = ba.budget_code
       WHERE ${whereClause}
       GROUP BY bp.plan_id, bp.budget_code, bp.project_name, bp.budget_type,
                bp.budget_amount, bp.plan_q1, bp.plan_q2, bp.plan_q3, bp.plan_q4
       ORDER BY bp.plan_id ASC
       LIMIT :limit OFFSET :offset`,
      { replacements, type: Sequelize.QueryTypes.SELECT }
    )

    // ดึง disbursements สำหรับ budget_codes ที่อยู่ในหน้านี้
    const budgetCodes = planRows.map(r => r.budget_code)
    const disbMap = {}

    if (budgetCodes.length > 0) {
      const disbRows = await sequelize.query(
        `SELECT ba.budget_code, bd.disburse_type,
                COALESCE(SUM(bd.amount),0) AS total
         FROM "BudgetDisbursements" bd
         JOIN "BudgetActivities" ba ON bd.activity_code = ba.activity_code
         WHERE ba.budget_code IN (:budgetCodes)
         GROUP BY ba.budget_code, bd.disburse_type`,
        { replacements: { budgetCodes }, type: Sequelize.QueryTypes.SELECT }
      )
      disbRows.forEach(r => {
        if (!disbMap[r.budget_code]) disbMap[r.budget_code] = { disbursed: 0, committed: 0 }
        const t = r.disburse_type ? r.disburse_type.trim() : ''
        if (t.startsWith('2')) disbMap[r.budget_code].disbursed += parseFloat(r.total)
        else if (t.startsWith('1')) disbMap[r.budget_code].committed += parseFloat(r.total)
      })
    }

    const data = planRows.map(row => {
      const d = disbMap[row.budget_code] || { disbursed: 0, committed: 0 }
      return {
        id:             String(row.plan_id),
        budgetCode:     row.budget_code,
        name:           row.project_name,
        budgetType:     row.budget_type,
        budget:         parseFloat(row.budget_amount) || 0,
        disbursed:      Math.round(d.disbursed),
        committed:      Math.round(d.committed),
        activityCount:  parseInt(row.activity_count) || 0,
        totalRequested: Math.round(parseFloat(row.total_requested) || 0),
        q1Budget:       parseFloat(row.plan_q1) || 0,
        q2Budget:       parseFloat(row.plan_q2) || 0,
        q3Budget:       parseFloat(row.plan_q3) || 0,
        q4Budget:       parseFloat(row.plan_q4) || 0,
      }
    })

    res.json({
      result: { total, page, limit, data }
    })

  } catch (error) {
    res.status(500).json({ error: true, message: error.toString() })
  }
})

// ---------------------------------------------------------------------------
// GET /api/v2/dashboard/budget/activities
//
// Query params:
//   budgetCode  string   required  รหัสงบประมาณ
// ---------------------------------------------------------------------------
router.get('/activities', async (req, res) => {
  try {
    const budgetCode = (req.query.budgetCode || '').trim()
    if (!budgetCode) {
      return res.status(400).json({ error: true, message: 'budgetCode is required' })
    }

    const actRows = await sequelize.query(
      `SELECT ba.activity_id, ba.activity_code, ba.activity_name,
              ba.budget_requested, ba.start_date, ba.end_date,
              COALESCE(SUM(CASE WHEN bd.disburse_type LIKE '2%' THEN bd.amount ELSE 0 END),0) AS disbursed,
              COALESCE(SUM(CASE WHEN bd.disburse_type LIKE '1%' THEN bd.amount ELSE 0 END),0) AS committed
       FROM "BudgetActivities" ba
       LEFT JOIN "BudgetDisbursements" bd ON ba.activity_code = bd.activity_code
       WHERE ba.budget_code = :budgetCode
       GROUP BY ba.activity_id, ba.activity_code, ba.activity_name,
                ba.budget_requested, ba.start_date, ba.end_date
       ORDER BY ba.activity_id ASC`,
      { replacements: { budgetCode }, type: Sequelize.QueryTypes.SELECT }
    )

    const data = actRows.map(r => ({
      id:              r.activity_id,
      activityCode:    r.activity_code,
      name:            r.activity_name,
      budgetRequested: parseFloat(r.budget_requested) || 0,
      disbursed:       Math.round(parseFloat(r.disbursed) || 0),
      committed:       Math.round(parseFloat(r.committed) || 0),
      startDate:       r.start_date,
      endDate:         r.end_date,
    }))

    res.json({ result: { budgetCode, data } })

  } catch (error) {
    res.status(500).json({ error: true, message: error.toString() })
  }
})

module.exports = router
