const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const academicProgram = require('../../models/sciences/academicProgram')
const department = require('../../models/sciences/department')
const constants = require('../../config/constant')
const JwtMiddleware = require('../../config/Jwt-Middleware')

//  @route              POST  /api/v2/academic-program
//  @desc               Add academic program using formidable
//  @access             Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const form = new formidable.IncomingForm()
    form.parse(req, async (error, fields, files) => {
        if (error) {
            return res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
        }
        let result = await academicProgram.create(fields)
        res.json({ status: constants.kResultOk, result: result })
    })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/academic-program/list
//  @desc               List all academic programs
//  @access             Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await academicProgram.findAll({
      include: [
        { model: department, attributes: ['dept_name'] },
      ],
      attributes: [ ['program_id', 'id'], 'program_id', 'program_name','degree_level' ]
    })
    res.json({ status: constants.kResultOk, result: result })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/academic-program/:id
//  @desc               Get academic program by id
//  @access             Private
router.get('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await academicProgram.findOne(
      { 
      where: { program_id: req.params.id },
      include: [
        { model: department, attributes: ['dept_name'] },
      ],
      attributes: [ ['program_id', 'id'], 'program_id', 'program_name','degree_level' ]    
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

//  @route              PUT  /api/v2/academic-program/:id
//  @desc               Update academic program by id using formidable
//  @access             Private
router.put('/:id', JwtMiddleware.checkToken, async (req, res) => {
    try {
        const form = new formidable.IncomingForm()
        form.parse(req, async (error, fields, files) => {
            if (error) {
                return res.json({ result: constants.kResultNok, result: JSON.stringify(error) })
            }
            let [rowsUpdated] = await academicProgram.update(fields, { where: { program_id: req.params.id } })
            if (rowsUpdated > 0) {
                let result = await academicProgram.findOne({ where: { program_id: req.params.id } })
                res.json({ status: constants.kResultOk, result: result })
            } else {
                res.json({ status: constants.kResultNok, result: 'Update failed, record not found or no new data.' })
            }
        })
    } catch (error) {
        res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
    }
})

//  @route              DELETE  /api/v2/academic-program/:id
//  @desc               Delete academic program by id
//  @access             Private
router.delete('/:id', JwtMiddleware.checkToken, async (req, res) => {
    try {
        const deleted = await academicProgram.destroy({ where: { program_id: req.params.id } })
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
