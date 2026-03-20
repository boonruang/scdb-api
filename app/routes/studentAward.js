const express = require('express')
const router = express.Router()
const { Op } = require('sequelize')
const formidable = require('formidable')
const studentAward = require('../../models/sciences/studentAward')
const student = require('../../models/sciences/student')
const constants = require('../../config/constant')
const JwtMiddleware = require('../../config/Jwt-Middleware')

router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const form = new formidable.IncomingForm()
    form.parse(req, async (error, fields) => {
      if (error) return res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
      let result = await studentAward.create(fields)
      res.json({ status: constants.kResultOk, result: result })
    })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await studentAward.findAll({
      include: [{ model: student, attributes: ['student_id', 'firstname', 'lastname', 'studentOfficial_id'] }],
      attributes: [['award_id', 'id'], 'award_id', 'student_id', 'award_name', 'award_level', 'venue', 'award_date'],
      order: [['award_id', 'DESC']],
    })
    res.json({ status: constants.kResultOk, result: result })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

//  @route  POST /api/v2/studentaward/bulk
//  @desc   Bulk import awards from Excel — resolves studentOfficial_id → student_id
router.post('/bulk', JwtMiddleware.checkToken, async (req, res) => {
  try {
    var records = Array.isArray(req.body) ? req.body : (req.body.records || [])
    if (!records.length) return res.json({ status: constants.kResultNok, result: 'No data provided' })

    // Resolve studentOfficial_id → student_id
    var officialIds = records.map(function(r) { return r.studentOfficial_id }).filter(Boolean)
    var studentRows = await student.findAll({
      where: { studentOfficial_id: { [Op.in]: officialIds } },
      attributes: ['student_id', 'studentOfficial_id'],
    })
    var studentMap = {}
    studentRows.forEach(function(s) { studentMap[s.studentOfficial_id] = s.student_id })

    var toInsert = records.map(function(r) {
      var sid = studentMap[r.studentOfficial_id] || null
      return {
        student_id: sid,
        award_name: r.award_name || null,
        award_level: r.award_level || null,
        venue: r.venue || null,
        award_date: r.award_date || null,
      }
    })

    var created = await studentAward.bulkCreate(toInsert, { ignoreDuplicates: false })
    res.json({ status: constants.kResultOk, count: created.length })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

router.get('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await studentAward.findOne({
      where: { award_id: req.params.id },
      include: [{ model: student, attributes: ['student_id', 'firstname', 'lastname', 'studentOfficial_id'] }],
      attributes: [['award_id', 'id'], 'award_id', 'student_id', 'award_name', 'award_level', 'venue', 'award_date'],
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
      let [rowsUpdated] = await studentAward.update(fields, { where: { award_id: req.params.id } })
      if (rowsUpdated > 0) {
        let result = await studentAward.findOne({ where: { award_id: req.params.id } })
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
    const deleted = await studentAward.destroy({ where: { award_id: req.params.id } })
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
