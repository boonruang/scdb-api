const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const BudgetDisbursement = require('../../models/sciences/budgetDisbursement')
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
