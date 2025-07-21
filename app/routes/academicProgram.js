const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const academicProgram = require('../../models/sciences/academicProgram')
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
            return res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
        }
        let result = await academicProgram.create(fields)
        res.json({ result: constants.kResultOk, message: result })
    })
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/academic-program/list
//  @desc               List all academic programs
//  @access             Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await academicProgram.findAll()
    res.json({ result: constants.kResultOk, message: result })
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/academic-program/:id
//  @desc               Get academic program by id
//  @access             Private
router.get('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await academicProgram.findOne({ where: { program_id: req.params.id } })
    if (result) {
      res.json({ result: constants.kResultOk, message: result })
    } else {
      res.json({ result: constants.kResultNok, message: 'Not found' })
    }
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
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
                return res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
            }
            let [rowsUpdated] = await academicProgram.update(fields, { where: { program_id: req.params.id } })
            if (rowsUpdated > 0) {
                let result = await academicProgram.findOne({ where: { program_id: req.params.id } })
                res.json({ result: constants.kResultOk, message: result })
            } else {
                res.json({ result: constants.kResultNok, message: 'Update failed, record not found or no new data.' })
            }
        })
    } catch (error) {
        res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
    }
})

//  @route              DELETE  /api/v2/academic-program/:id
//  @desc               Delete academic program by id
//  @access             Private
router.delete('/:id', JwtMiddleware.checkToken, async (req, res) => {
    try {
        const deleted = await academicProgram.destroy({ where: { program_id: req.params.id } })
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
