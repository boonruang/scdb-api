const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const Staff = require('../../models/sciences/staff')
const leaveRecord = require('../../models/sciences/leaveRecord')
const constants = require('../../config/constant')
const JwtMiddleware = require('../../config/Jwt-Middleware')

//  @route              POST  /api/v2/leave-record
//  @desc               Add leave record using formidable
//  @access             Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const form = new formidable.IncomingForm()
    form.parse(req, async (error, fields, files) => {
        if (error) {
            return res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
        }
        let result = await leaveRecord.create(fields)
        res.json({ status: constants.kResultOk, result: result })
    })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/leave-record/list
//  @desc               List all leave records
//  @access             Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await leaveRecord.findAll(
      {
      include: [
        {model: Staff},
      ],     
      attributes: [ ['leave_id', 'id'],'leave_id', 'leave_type', 'start_date', 'end_date']  
      }
    )    
    res.json({ status: constants.kResultOk, result: result })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/leave-record/:id
//  @desc               Get leave record by id
//  @access             Private
router.get('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await leaveRecord.findOne(
      { 
      where: { leave_id: req.params.id },
      include: [
        {model: Staff}
      ],
      attributes: [ ['leave_id', 'id'],'leave_id',  'leave_type', 'leave_type', 'start_date', 'end_date']        
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

//  @route              PUT  /api/v2/leave-record/:id
//  @desc               Update leave record by id using formidable
//  @access             Private
router.put('/:id', JwtMiddleware.checkToken, async (req, res) => {
    try {
        const form = new formidable.IncomingForm()
        form.parse(req, async (error, fields, files) => {
            if (error) {
                return res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
            }
            let [rowsUpdated] = await leaveRecord.update(fields, { where: { leave_id: req.params.id } })
            if (rowsUpdated > 0) {
                let result = await leaveRecord.findOne({ where: { leave_id: req.params.id } })
                res.json({ status: constants.kResultOk, result: result })
            } else {
                res.json({ status: constants.kResultNok, result: 'Update failed, record not found or no new data.' })
            }
        })
    } catch (error) {
        res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
    }
})

//  @route              DELETE  /api/v2/leave-record/:id
//  @desc               Delete leave record by id
//  @access             Private
router.delete('/:id', JwtMiddleware.checkToken, async (req, res) => {
    try {
        const deleted = await leaveRecord.destroy({ where: { leave_id: req.params.id } })
        if (deleted) {
            res.json({ status: constants.kResultOk, result: 'Record deleted successfully.' })
        } else {
            res.json({ status: constants.kResultNok, result: 'Record not found.' })
        }
    } catch (error) {
        res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
    }
})

// POST /api/v2/leaverecord/bulk — bulk insert LeaveRecords matched by position_no → staff_id
router.post('/bulk', async (req, res) => {
  try {
    var records = req.body
    if (!Array.isArray(records) || records.length === 0) {
      return res.json({ status: constants.kResultNok, result: 'No data' })
    }
    // หา staff_id จาก position_no
    var posNos = [...new Set(records.map(function(r) { return String(r.position_no || '') }).filter(Boolean))]
    var staffRows = await Staff.findAll({ where: { position_no: posNos }, attributes: ['staff_id', 'position_no'] })
    var staffMap = {}
    staffRows.forEach(function(s) { staffMap[String(s.position_no)] = s.staff_id })

    var toInsert = records.map(function(r) {
      return {
        staff_id: staffMap[String(r.position_no)] || null,
        leave_type: r.leave_type || null,
        start_date: r.start_date || null,
        end_date: r.end_date || null,
      }
    }).filter(function(r) { return r.staff_id })

    await leaveRecord.bulkCreate(toInsert)
    res.json({ status: constants.kResultOk, count: toInsert.length })
  } catch (e) {
    res.json({ status: constants.kResultNok, result: e.message })
  }
})

module.exports = router
