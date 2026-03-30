const express = require('express')
const router = express.Router()
const { Op } = require('sequelize')
const formidable = require('formidable')
const studentGrant = require('../../models/sciences/studentGrant')
const Students = require('../../models/sciences/student')
const constants = require('../../config/constant')
const JwtMiddleware = require('../../config/Jwt-Middleware')

//  @route              POST  /api/v2/student-grant
//  @desc               Add student grant using formidable
//  @access             Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const form = new formidable.IncomingForm()
    form.parse(req, async (error, fields, files) => {
        if (error) {
            return res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
        }
        let result = await studentGrant.create(fields)
        res.json({ status: constants.kResultOk, result: result })
    })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/student-grant/list
//  @desc               List all student grants
//  @access             Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await studentGrant.findAll(
      {
      include: [
        {model: Students},
      ],     
      attributes: [ ['grant_id', 'id'], 'grant_id', 'student_id', 'grant_name', 'conference_name', 'amount', 'grant_type', 'grant_source', 'loan_status' ]
      }
    )    
    res.json({ status: constants.kResultOk, result: result })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/student-grant/:id
//  @desc               Get student grant by id
//  @access             Private
//  @route  POST /api/v2/studentgrant/bulk
//  @desc   Bulk import student grants, resolve studentOfficial_id → student_id
router.post('/bulk', JwtMiddleware.checkToken, async (req, res) => {
  try {
    var records = Array.isArray(req.body) ? req.body : (req.body.records || [])
    if (!records.length) return res.json({ status: constants.kResultNok, result: 'No data provided' })

    var officialIds = records.map(function(r) { return r.studentOfficial_id }).filter(Boolean)
    var studentRows = await Students.findAll({
      where: { studentOfficial_id: { [Op.in]: officialIds } },
      attributes: ['student_id', 'studentOfficial_id'],
    })
    var studentMap = {}
    studentRows.forEach(function(s) { studentMap[s.studentOfficial_id] = s.student_id })

    var toInsert = records.map(function(r) {
      return {
        student_id: studentMap[r.studentOfficial_id] || null,
        grant_name: r.grant_name || null,
        amount: parseFloat(r.amount) || 0,
        grant_type: r.grant_type || null,
        grant_source: r.grant_source || null,
        loan_status: r.loan_status || null,
      }
    }).filter(function(r) { return r.student_id })

    var created = await studentGrant.bulkCreate(toInsert, { ignoreDuplicates: false })
    res.json({ status: constants.kResultOk, count: created.length })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

router.get('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await studentGrant.findOne(
      { 
      where: { grant_id: req.params.id },
      include: [
        {model: Students}
      ],    
      attributes: [ ['grant_id', 'id'], 'grant_id', 'student_id', 'grant_name', 'conference_name', 'amount', 'grant_type', 'grant_source', 'loan_status' ]
      }
    )     
    if (result) {
      res.json({ status: constants.kResultOk, result: result })
    } else {
      res.json({ status: constants.kResultNok, result: 'Not found' })
    }
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

//  @route              PUT  /api/v2/student-grant/:id
//  @desc               Update student grant by id using formidable
//  @access             Private
router.put('/:id', JwtMiddleware.checkToken, async (req, res) => {
    try {
        const form = new formidable.IncomingForm()
        form.parse(req, async (error, fields, files) => {
            if (error) {
                return res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
            }
            let [rowsUpdated] = await studentGrant.update(fields, { where: { grant_id: req.params.id } })
            if (rowsUpdated > 0) {
                let result = await studentGrant.findOne({ where: { grant_id: req.params.id } })
                res.json({ result: constants.kResultOk, message: result })
            } else {
                res.json({ result: constants.kResultNok, message: 'Update failed, record not found or no new data.' })
            }
        })
    } catch (error) {
        res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
    }
})

//  @route              DELETE  /api/v2/student-grant/:id
//  @desc               Delete student grant by id
//  @access             Private
router.delete('/:id', JwtMiddleware.checkToken, async (req, res) => {
    try {
        const deleted = await studentGrant.destroy({ where: { grant_id: req.params.id } })
        if (deleted) {
            res.json({ result: constants.kResultOk, message: 'Record deleted successfully.' })
        } else {
            res.json({ result: constants.kResultNok, message: 'Record not found.' })
        }
    } catch (error) {
        res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
    }
})


module.exports = router
