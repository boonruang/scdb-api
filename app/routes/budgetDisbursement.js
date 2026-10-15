const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const BudgetDisbursement = require('../../models/sciences/budgetDisbursement')
const BudgetActivity = require('../../models/sciences/budgetActivity')
const sequelize = require('../../config/db-instance')
const constants = require('../../config/constant')
const JwtMiddleware = require('../../config/Jwt-Middleware')

router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const where = req.query.activity_code ? { activity_code: req.query.activity_code } : {}
    let result = await BudgetDisbursement.findAll({ where, order: [['disbursement_id', 'ASC']] })
    res.json({ status: constants.kResultOk, result })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

router.get('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await BudgetDisbursement.findOne({ where: { disbursement_id: req.params.id } })
    if (result) res.json({ status: constants.kResultOk, result })
    else res.json({ status: constants.kResultNok, result: 'Not found' })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

router.post('/validate-activity-codes', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const { activityCodes } = req.body
    const existing = await BudgetActivity.findAll({ where: { activity_code: activityCodes }, attributes: ['activity_code'] })
    const found = existing.map(r => r.activity_code)
    const missing = activityCodes.filter(c => !found.includes(c))
    res.json({ status: constants.kResultOk, missing })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

// POST /bulk — กันซ้ำก่อนนำเข้า
// key: มี FIN/PO → (activity_code, disburse_type, fin_no, po_no)
//      ไม่มี      → (activity_code, disburse_type, disburse_date, amount)
// ตรงกับแถวเดิมใน DB = update, ไม่ตรง = insert, ซ้ำกันเองในไฟล์ = เอาแถวล่างสุด
const text = (v) => (v === null || v === undefined ? '' : String(v).trim())

function coerceDisbursement(item) {
  const n = parseFloat(typeof item.amount === 'string' ? item.amount.replace(/,/g, '') : item.amount)
  return {
    activity_code: text(item.activity_code),
    disburse_date: text(item.disburse_date) || null,
    disburse_type: text(item.disburse_type) || null,
    amount: isNaN(n) ? 0 : n,
    fin_no: text(item.fin_no) || null,
    po_no: text(item.po_no) || null,
    note: text(item.note) || null,
  }
}

function disbursementWhere(row) {
  const base = { activity_code: row.activity_code, disburse_type: row.disburse_type }
  if (row.fin_no || row.po_no) return { ...base, fin_no: row.fin_no, po_no: row.po_no }
  return { ...base, disburse_date: row.disburse_date, amount: row.amount, fin_no: null, po_no: null }
}

router.post('/bulk', JwtMiddleware.checkToken, async (req, res) => {
  try {
    if (!Array.isArray(req.body)) return res.json({ status: constants.kResultNok, result: 'Body must be an array' })

    let inserted = 0, updated = 0, skipped = 0
    const rows = new Map()
    for (const item of req.body) {
      const row = coerceDisbursement(item)
      if (!row.activity_code) { skipped++; continue }
      rows.set(JSON.stringify(disbursementWhere(row)), row)
    }
    const dupInFile = req.body.length - skipped - rows.size

    await sequelize.transaction(async (t) => {
      for (const row of rows.values()) {
        const [affected] = await BudgetDisbursement.update(row, { where: disbursementWhere(row), transaction: t })
        if (affected > 0) updated++
        else { await BudgetDisbursement.create(row, { transaction: t }); inserted++ }
      }
    })

    res.json({ status: constants.kResultOk, inserted, updated, skipped, dupInFile, total: rows.size })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: error.message })
  }
})

router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const form = new formidable.IncomingForm()
    form.parse(req, async (error, fields) => {
      if (error) return res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
      const actCode = Array.isArray(fields.activity_code) ? fields.activity_code[0] : fields.activity_code
      const activity = await BudgetActivity.findOne({ where: { activity_code: actCode } })
      if (!activity) return res.json({ status: constants.kResultNok, result: 'ไม่พบรหัสกิจกรรม ' + actCode + ' ในระบบ' })
      let result = await BudgetDisbursement.create(fields)
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
      const actCode = Array.isArray(fields.activity_code) ? fields.activity_code[0] : fields.activity_code
      const activity = await BudgetActivity.findOne({ where: { activity_code: actCode } })
      if (!activity) return res.json({ status: constants.kResultNok, result: 'ไม่พบรหัสกิจกรรม ' + actCode + ' ในระบบ' })
      const { disbursement_id, ...rest } = fields
      let [rowsUpdated] = await BudgetDisbursement.update(rest, { where: { disbursement_id } })
      if (rowsUpdated > 0) {
        let result = await BudgetDisbursement.findOne({ where: { disbursement_id } })
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
    const deleted = await BudgetDisbursement.destroy({ where: { disbursement_id: req.params.id } })
    if (deleted) res.json({ status: constants.kResultOk, result: 'Deleted' })
    else res.json({ status: constants.kResultNok, result: 'Not found' })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

module.exports = router
