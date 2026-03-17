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

router.post('/bulk', JwtMiddleware.checkToken, async (req, res) => {
  try {
    if (!Array.isArray(req.body)) return res.json({ status: constants.kResultNok, result: 'Body must be an array' })
    let result = await BudgetActivity.bulkCreate(req.body)
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
