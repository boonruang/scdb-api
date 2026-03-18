const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const BudgetDisbursement = require('../../models/sciences/budgetDisbursement')
const BudgetActivity = require('../../models/sciences/budgetActivity')
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

router.post('/bulk', JwtMiddleware.checkToken, async (req, res) => {
  try {
    if (!Array.isArray(req.body)) return res.json({ status: constants.kResultNok, result: 'Body must be an array' })
    let result = await BudgetDisbursement.bulkCreate(req.body)
    res.json({ status: constants.kResultOk, result })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
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
