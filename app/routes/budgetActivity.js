const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const BudgetActivity = require('../../models/sciences/budgetActivity')
const sequelize = require('../../config/db-instance')
const constants = require('../../config/constant')
const JwtMiddleware = require('../../config/Jwt-Middleware')

router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const where = req.query.budget_code ? { budget_code: req.query.budget_code } : {}
    let result = await BudgetActivity.findAll({ where, order: [['activity_id', 'ASC']] })
    res.json({ status: constants.kResultOk, result })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

router.get('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await BudgetActivity.findOne({ where: { activity_id: req.params.id } })
    if (result) res.json({ status: constants.kResultOk, result })
    else res.json({ status: constants.kResultNok, result: 'Not found' })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

router.post('/validate-codes', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const { budgetCodes } = req.body
    const Sequelize = require('sequelize')
    const BudgetPlan = require('../../models/sciences/budgetPlan')

    const existing = await BudgetPlan.findAll({
      where: { budget_code: budgetCodes },
      attributes: ['budget_code']
    })
    const found = existing.map(r => r.budget_code)
    const missing = budgetCodes.filter(c => !found.includes(c))

    const maxRows = await sequelize.query(
      `SELECT budget_code, MAX(activity_code) AS max_code
       FROM "BudgetActivities"
       WHERE budget_code IN (:budgetCodes)
       GROUP BY budget_code`,
      { replacements: { budgetCodes }, type: Sequelize.QueryTypes.SELECT }
    )
    const maxCodes = {}
    maxRows.forEach(r => { maxCodes[r.budget_code] = r.max_code })

    res.json({ status: constants.kResultOk, missing, maxCodes })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

// POST /bulk — upsert by (budget_code, activity_code)
// จับคู่ด้วยการ query ตรงๆ ไม่ใช้ ON CONFLICT เพราะตาราง BudgetActivities
// ไม่มี unique index (budget_code, activity_code) — ใช้ ON CONFLICT แล้ว Postgres จะตอบ 42P10
const ACTIVITY_FIELDS = Object.keys(BudgetActivity.rawAttributes).filter((k) => k !== 'activity_id')

// แปลงค่าจาก Excel ให้ตรงชนิดคอลัมน์ ค่าว่างของ INTEGER/DATE ต้องเป็น null ไม่ใช่ ''
function coerceActivity(item) {
  const row = {}
  for (const field of ACTIVITY_FIELDS) {
    const raw = item[field]
    const kind = BudgetActivity.rawAttributes[field].type.key
    if (kind === 'INTEGER' || kind === 'FLOAT') {
      const n = parseFloat(typeof raw === 'string' ? raw.replace(/,/g, '') : raw)
      row[field] = isNaN(n) ? 0 : n
    } else if (kind === 'DATEONLY' || kind === 'DATE') {
      const v = raw === null || raw === undefined ? '' : String(raw).trim()
      row[field] = v === '' ? null : v
    } else {
      const v = raw === null || raw === undefined ? '' : String(raw).trim()
      row[field] = v === '' ? null : v
    }
  }
  return row
}

router.post('/bulk', JwtMiddleware.checkToken, async (req, res) => {
  try {
    if (!Array.isArray(req.body)) return res.json({ status: constants.kResultNok, result: 'Body must be an array' })

    let inserted = 0, updated = 0, skipped = 0
    const duplicates = []
    // รหัสกิจกรรมซ้ำกันเองในไฟล์ ให้เหลือแถวเดียว (เอาแถวล่างสุด) ส่วนแถวที่ไม่มีรหัสกิจกรรมเข้าใหม่เสมอ
    const keyed = new Map()
    const unkeyed = []
    for (const item of req.body) {
      const row = coerceActivity(item)
      if (!row.budget_code || !row.activity_name) { skipped++; continue }
      if (row.activity_code) keyed.set(row.budget_code + '|' + row.activity_code, row)
      else unkeyed.push(row)
    }

    await sequelize.transaction(async (t) => {
      for (const row of keyed.values()) {
        const where = { budget_code: row.budget_code, activity_code: row.activity_code }
        const [affected] = await BudgetActivity.update(row, { where, transaction: t })
        if (affected > 0) {
          updated++
          if (affected > 1) duplicates.push({ activity_code: row.activity_code, rows: affected })
        } else {
          await BudgetActivity.create(row, { transaction: t })
          inserted++
        }
      }
      for (const row of unkeyed) {
        await BudgetActivity.create(row, { transaction: t })
        inserted++
      }
    })

    res.json({ status: constants.kResultOk, inserted, updated, skipped, duplicates, total: keyed.size + unkeyed.length })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: error.message })
  }
})

router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const form = new formidable.IncomingForm()
    form.parse(req, async (error, fields) => {
      if (error) return res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
      let result = await BudgetActivity.create(fields)
      res.json({ status: constants.kResultOk, result })
    })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

router.put('/', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const form = new formidable.IncomingForm()
    form.parse(req, async (error, fields) => {
      if (error) return res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
      const { activity_id, ...rest } = fields
      let [rowsUpdated] = await BudgetActivity.update(rest, { where: { activity_id } })
      if (rowsUpdated > 0) {
        let result = await BudgetActivity.findOne({ where: { activity_id } })
        res.json({ status: constants.kResultOk, result })
      } else {
        res.json({ status: constants.kResultNok, result: 'Update failed' })
      }
    })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

router.delete('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const deleted = await BudgetActivity.destroy({ where: { activity_id: req.params.id } })
    if (deleted) res.json({ status: constants.kResultOk, result: 'Deleted' })
    else res.json({ status: constants.kResultNok, result: 'Not found' })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

module.exports = router
