const express = require('express')
const router = express.Router()
const staff = require('../../models/sciences/staff')
const Departments = require('../../models/sciences/department')
const Stafftype = require('../../models/sciences/stafftype')
const constants = require('../../config/constant')
const JwtMiddleware = require('../../config/Jwt-Middleware')
const formidable = require('formidable')

//  @route              POST  /api/v2/staff
//  @desc               Add staff using formidable
//  @access             Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('staff add is called')
  try {
    const form = new formidable.IncomingForm() 
    form.parse(req, async (error, fields, files) => {
      console.log('req files',files)
      console.log('req fields',fields)      
        if (error) {
            return res.json({ status: constants.kResultNok, result: JSON.stringify(error) }) 
        }
        let result = await staff.create(fields) 
        res.json({ status: constants.kResultOk, result: result }) 
    }) 
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) }) 
  }
}) 

//  @route              GET  /api/v2/staff/list
//  @desc               List all staff
//  @access             Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  console.log('staff list is called')
  try {
    let result = await staff.findAll(
      {
      include: [
        {model: Departments},
        {model: Stafftype},
      ],     
      attributes: [ ['staff_id', 'id'], 'staff_id', 'stafftype_id','department_id', 'firstname','lastname','position', 'position_no', 'education', 'startdate', 'birthday', 'email', 'office_location',],
      order: [
        ['staff_id','DESC']
      ],   
      }
    )
    res.json({ status: constants.kResultOk, result: result })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
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
        {model: Departments},
        {model: Stafftype},
      ],
      attributes: [ ['staff_id', 'id'], 'staff_id', 'stafftype_id','department_id', 'firstname','lastname','position', 'position_no', 'education', 'startdate', 'birthday', 'email', 'office_location',]   
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

//  @route              PUT  /api/v2/staff/:id
//  @desc               Update staff by id using formidable
//  @access             Private
router.put('/', JwtMiddleware.checkToken, async (req, res) => {
    console.log('staff update is called')
    try {
        const form = new formidable.IncomingForm() 
        form.parse(req, async (error, fields, files) => {

          const { staff_id, ...rest } = fields

            if (error) {
                return res.json({ result: constants.kResultNok, message: JSON.stringify(error) }) 
            }
            let [rowsUpdated] = await staff.update(fields, { where: { staff_id: staff_id } }) 
            if (rowsUpdated > 0) {
                let result = await staff.findOne({ where: { staff_id: staff_id } }) 
                res.json({ status: constants.kResultOk, result: result }) 
            } else {
                res.json({ status: constants.kResultNok, result: 'Update failed, record not found or no new data.' }) 
            }
        }) 
    } catch (error) {
        res.json({ status: constants.kResultNok, result: JSON.stringify(error) }) 
    }
}) 

//  @route              DELETE  /api/v2/staff/:id
//  @desc               Delete staff by id
//  @access             Private
router.delete('/:id', JwtMiddleware.checkToken, async (req, res) => {
    try {
        const deleted = await staff.destroy({ where: { staff_id: req.params.id } }) 
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
