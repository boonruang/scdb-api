const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const BudgetPlan = require('../../models/sciences/budgetPlan')
const sequelize = require('../../config/db-instance')
const constants = require('../../config/constant')
const JwtMiddleware = require('../../config/Jwt-Middleware')

// GET /list
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await BudgetPlan.findAll({ order: [['plan_id', 'ASC']] })
    res.json({ status: constants.kResultOk, result })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

// GET /:id
router.get('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await BudgetPlan.findOne({ where: { plan_id: req.params.id } })
    if (result) res.json({ status: constants.kResultOk, result })
    else res.json({ status: constants.kResultNok, result: 'Not found' })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

// POST /bulk  — upsert by (budget_code, fiscal_year)
// จับคู่ด้วยการ query ตรงๆ ไม่ใช้ ON CONFLICT เพราะตาราง BudgetPlans
// ไม่มี unique index (budget_code, fiscal_year) — ใช้ ON CONFLICT แล้ว Postgres จะตอบ 42P10
router.post('/bulk', JwtMiddleware.checkToken, async (req, res) => {
  try {
    if (!Array.isArray(req.body)) return res.json({ status: constants.kResultNok, result: 'Body must be an array' })

    const num = (v) => {
      // Excel ส่งมาเป็นตัวเลข แต่กันเคสที่ copy มาเป็น '1,000'
      const n = parseFloat(typeof v === 'string' ? v.replace(/,/g, '') : v)
      return isNaN(n) ? 0 : n
    }
    const text = (v) => (v === null || v === undefined ? '' : String(v).trim())

    // รหัสเดียวกัน + ปีเดียวกัน ที่ซ้ำกันเองในไฟล์ ให้เหลือแถวเดียว (เอาแถวล่างสุด)
    const rows = new Map()
    let skipped = 0
    for (const item of req.body) {
      const budget_code = text(item.budget_code)
      const project_name = text(item.project_name)
      if (!budget_code || !project_name) { skipped++; continue }
      const fy = parseInt(item.fiscal_year, 10)
      const fiscal_year = isNaN(fy) ? null : fy
      rows.set(budget_code + '|' + fiscal_year, {
        budget_code,
        project_name,
        budget_type: text(item.budget_type) || null,
        budget_amount: num(item.budget_amount),
        plan_q1: num(item.plan_q1),
        plan_q2: num(item.plan_q2),
        plan_q3: num(item.plan_q3),
        plan_q4: num(item.plan_q4),
        fiscal_year,
      })
    }

    let inserted = 0, updated = 0
    const duplicates = []
    await sequelize.transaction(async (t) => {
      for (const row of rows.values()) {
        const where = { budget_code: row.budget_code, fiscal_year: row.fiscal_year }
        const [affected] = await BudgetPlan.update(row, { where, transaction: t })
        if (affected > 0) {
          updated++
          // ตาราง (ยัง) ไม่มี unique index รหัสเดียวกันจึงมีได้หลายแถว อัปเดตให้ครบทุกแถวแล้วรายงานกลับ
          if (affected > 1) duplicates.push({ budget_code: row.budget_code, rows: affected })
        } else {
          await BudgetPlan.create(row, { transaction: t })
          inserted++
        }
      }
    })

    res.json({ status: constants.kResultOk, inserted, updated, skipped, duplicates, total: rows.size })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: error.message })
  }
})

// POST /
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const form = new formidable.IncomingForm()
    form.parse(req, async (error, fields) => {
      if (error) return res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
      let result = await BudgetPlan.create(fields)
      res.json({ status: constants.kResultOk, result })
    })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

// PUT /
router.put('/', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const form = new formidable.IncomingForm()
    form.parse(req, async (error, fields) => {
      if (error) return res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
      const { plan_id, ...rest } = fields
      let [rowsUpdated] = await BudgetPlan.update(rest, { where: { plan_id } })
      if (rowsUpdated > 0) {
        let result = await BudgetPlan.findOne({ where: { plan_id } })
        res.json({ status: constants.kResultOk, result })
      } else {
        res.json({ status: constants.kResultNok, result: 'Update failed' })
      }
    })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

// DELETE /:id
router.delete('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const deleted = await BudgetPlan.destroy({ where: { plan_id: req.params.id } })
    if (deleted) res.json({ status: constants.kResultOk, result: 'Deleted' })
    else res.json({ status: constants.kResultNok, result: 'Not found' })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

module.exports = router
