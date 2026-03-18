const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const BudgetPlan = require('../../models/sciences/budgetPlan')
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
router.post('/bulk', JwtMiddleware.checkToken, async (req, res) => {
  try {
    if (!Array.isArray(req.body)) return res.json({ status: constants.kResultNok, result: 'Body must be an array' })
    let inserted = 0, updated = 0
    for (const item of req.body) {
      const [, created] = await BudgetPlan.upsert(item, {
        conflictFields: ['budget_code', 'fiscal_year']
      })
      if (created) inserted++
      else updated++
    }
    res.json({ status: constants.kResultOk, inserted, updated, total: req.body.length })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
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
