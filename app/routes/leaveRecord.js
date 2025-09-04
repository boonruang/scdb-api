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

module.exports = router
