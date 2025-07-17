const express = require('express')
const router = express.Router()
const leaveRecord = require('../../models/sciences/leaveRecord')
const constants = require('../../config/constant')
const JwtMiddleware = require('../../config/Jwt-Middleware')

//  @route              POST  /api/v2/leave-record
//  @desc               Add leave record
//  @access             Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await leaveRecord.create(req.body)
    res.json({ result: constants.kResultOk, message: result })
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/leave-record/list
//  @desc               List all leave records
//  @access             Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await leaveRecord.findAll()
    res.json({ result: constants.kResultOk, message: result })
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/leave-record/:id
//  @desc               Get leave record by id
//  @access             Private
router.get('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await leaveRecord.findOne({ where: { leave_id: req.params.id } })
    if (result) {
      res.json({ result: constants.kResultOk, message: result })
    } else {
      res.json({ result: constants.kResultNok, message: 'Not found' })
    }
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
  }
})

module.exports = router