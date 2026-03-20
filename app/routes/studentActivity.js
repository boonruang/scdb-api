const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const studentActivity = require('../../models/sciences/studentActivity')
const constants = require('../../config/constant')
const JwtMiddleware = require('../../config/Jwt-Middleware')

router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const form = new formidable.IncomingForm()
    form.parse(req, async (error, fields) => {
      if (error) return res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
      let result = await studentActivity.create(fields)
      res.json({ status: constants.kResultOk, result: result })
    })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await studentActivity.findAll({
      attributes: [['activity_id', 'id'], 'activity_id', 'activity_code', 'activity_name', 'organizer', 'start_date', 'end_date', 'venue', 'participant_count', 'hours', 'budget_amount'],
      order: [['activity_id', 'DESC']],
    })
    res.json({ status: constants.kResultOk, result: result })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

//  @route  POST /api/v2/studentactivity/bulk
//  @desc   Bulk import student activities from Excel
router.post('/bulk', JwtMiddleware.checkToken, async (req, res) => {
  try {
    var records = Array.isArray(req.body) ? req.body : (req.body.records || [])
    if (!records.length) return res.json({ status: constants.kResultNok, result: 'No data provided' })
    var created = await studentActivity.bulkCreate(records, { ignoreDuplicates: false })
    res.json({ status: constants.kResultOk, count: created.length })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

router.get('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await studentActivity.findOne({
      where: { activity_id: req.params.id },
      attributes: [['activity_id', 'id'], 'activity_id', 'activity_code', 'activity_name', 'organizer', 'start_date', 'end_date', 'venue', 'participant_count', 'hours', 'budget_amount', 'participant_ids'],
    })
    if (result) {
      res.json({ status: constants.kResultOk, result: result })
    } else {
      res.json({ status: constants.kResultNok, result: 'Not found' })
    }
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

router.put('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const form = new formidable.IncomingForm()
    form.parse(req, async (error, fields) => {
      if (error) return res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
      let [rowsUpdated] = await studentActivity.update(fields, { where: { activity_id: req.params.id } })
      if (rowsUpdated > 0) {
        let result = await studentActivity.findOne({ where: { activity_id: req.params.id } })
        res.json({ status: constants.kResultOk, result: result })
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
    const deleted = await studentActivity.destroy({ where: { activity_id: req.params.id } })
    if (deleted) {
      res.json({ status: constants.kResultOk, result: 'Record deleted successfully.' })
    } else {
      res.json({ status: constants.kResultNok, result: 'Record not found.' })
    }
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

module.exports = router
