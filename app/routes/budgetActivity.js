const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const BudgetActivity = require('../../models/sciences/budgetActivity')
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
    const sequelize = require('../../config/db-instance')
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

router.post('/bulk', JwtMiddleware.checkToken, async (req, res) => {
  try {
    if (!Array.isArray(req.body)) return res.json({ status: constants.kResultNok, result: 'Body must be an array' })
    let inserted = 0, updated = 0
    for (const item of req.body) {
      const [, created] = await BudgetActivity.upsert(item, {
        conflictFields: ['budget_code', 'activity_code']
      })
      if (created) inserted++
      else updated++
    }
    res.json({ status: constants.kResultOk, inserted, updated, total: req.body.length })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
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
