const express = require('express')
const router = express.Router()
const staff = require('../../models/sciences/staff')
const department = require('../../models/sciences/department')
const constants = require('../../config/constant')
const JwtMiddleware = require('../../config/Jwt-Middleware')
const formidable = require('formidable')

//  @route              POST  /api/v2/staff
//  @desc               Add staff using formidable
//  @access             Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const form = new formidable.IncomingForm() 
    form.parse(req, async (error, fields, files) => {
        if (error) {
            return res.json({ result: constants.kResultNok, message: JSON.stringify(error) }) 
        }
        let result = await staff.create(fields) 
        res.json({ result: constants.kResultOk, message: result }) 
    }) 
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) }) 
  }
}) 

//  @route              GET  /api/v2/staff/list
//  @desc               List all staff
//  @access             Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await staff.findAll(
      {
      include: [
        {model: department},
      ]        
      }
    )
    res.json({ result: constants.kResultOk, message: result })
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/staff/:id
//  @desc               Get staff by id
//  @access             Private
router.get('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await staff.findOne(
      { 
      where: { staff_id: req.params.id },
      include: [
        {model: department}
      ]
    })
    if (result) {
      res.json({ result: constants.kResultOk, message: result })
    } else {
      res.json({ result: constants.kResultNok, message: 'Not found' })
    }
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
  }
})

//  @route              PUT  /api/v2/staff/:id
//  @desc               Update staff by id using formidable
//  @access             Private
router.put('/:id', JwtMiddleware.checkToken, async (req, res) => {
    try {
        const form = new formidable.IncomingForm() 
        form.parse(req, async (error, fields, files) => {
            if (error) {
                return res.json({ result: constants.kResultNok, message: JSON.stringify(error) }) 
            }
            let [rowsUpdated] = await staff.update(fields, { where: { staff_id: req.params.id } }) 
            if (rowsUpdated > 0) {
                let result = await staff.findOne({ where: { staff_id: req.params.id } }) 
                res.json({ result: constants.kResultOk, message: result }) 
            } else {
                res.json({ result: constants.kResultNok, message: 'Update failed, record not found or no new data.' }) 
            }
        }) 
    } catch (error) {
        res.json({ result: constants.kResultNok, message: JSON.stringify(error) }) 
    }
}) 

//  @route              DELETE  /api/v2/staff/:id
//  @desc               Delete staff by id
//  @access             Private
router.delete('/:id', JwtMiddleware.checkToken, async (req, res) => {
    try {
        const deleted = await staff.destroy({ where: { staff_id: req.params.id } }) 
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
