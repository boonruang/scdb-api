const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const Student = require('../../models/sciences/student')
const AcademicProgram = require('../../models/sciences/academicProgram')
const Staff = require('../../models/sciences/staff')
const constants = require('../../config/constant')
const JwtMiddleware = require('../../config/Jwt-Middleware')

//  @route              POST  /api/v2/student
//  @desc               Add student using formidable
//  @access             Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const form = new formidable.IncomingForm()
    form.parse(req, async (error, fields, files) => {
        if (error) {
            return res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
        }
        let result = await Student.create(fields)
        res.json({ status: constants.kResultOk, result: result })
    })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/student/list
//  @desc               List all students with program and advisor names
//  @access             Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const result = await Student.findAll({
      include: [
        { model: AcademicProgram, attributes: ['program_name'] },
        { model: Staff, as: 'advisor', attributes: ['name'] }
      ],
      attributes: [ ['student_id', 'id'], 'student_id', 'name' ]
    })
    res.json({ status: constants.kResultOk, result: result })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/student/:id
//  @desc               Get student by id with program and advisor names
//  @access             Private
router.get('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const result = await Student.findOne({
      where: { student_id: req.params.id },
      include: [
        { model: AcademicProgram, attributes: ['program_name'] },
        { model: Staff, as: 'advisor', attributes: ['name'] }
      ],
      attributes: [ ['student_id', 'id'], 'student_id', 'name' ]
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

//  @route              PUT  /api/v2/student/:id
//  @desc               Update student by id using formidable
//  @access             Private
router.put('/:id', JwtMiddleware.checkToken, async (req, res) => {
    try {
        const form = new formidable.IncomingForm()
        form.parse(req, async (error, fields, files) => {
            if (error) {
                return res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
            }
            let [rowsUpdated] = await Student.update(fields, { where: { student_id: req.params.id } })
            if (rowsUpdated > 0) {
                let result = await Student.findOne({ where: { student_id: req.params.id } })
                res.json({ status: constants.kResultOk, result: result })
            } else {
                res.json({ status: constants.kResultNok, result: 'Update failed, record not found or no new data.' })
            }
        })
    } catch (error) {
        res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
    }
})

//  @route              DELETE  /api/v2/student/:id
//  @desc               Delete student by id
//  @access             Private
router.delete('/:id', JwtMiddleware.checkToken, async (req, res) => {
    try {
        const deleted = await Student.destroy({ where: { student_id: req.params.id } })
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
