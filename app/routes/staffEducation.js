const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const staffEducation = require('../../models/sciences/staffEducation')
const constants = require('../../config/constant')
const JwtMiddleware = require('../../config/Jwt-Middleware')

//  @route              POST  /api/v2/staff-education
//  @desc               Add staff education using formidable
//  @access             Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const form = new formidable.IncomingForm()
    form.parse(req, async (error, fields, files) => {
        if (error) {
            return res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
        }
        let result = await staffEducation.create(fields)
        res.json({ result: constants.kResultOk, message: result })
    })
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/staff-education/list
//  @desc               List all staff education
//  @access             Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await staffEducation.findAll()
    res.json({ result: constants.kResultOk, message: result })
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/staff-education/:id
//  @desc               Get staff education by id
//  @access             Private
router.get('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await staffEducation.findOne({ where: { education_id: req.params.id } })
    if (result) {
      res.json({ result: constants.kResultOk, message: result })
    } else {
      res.json({ result: constants.kResultNok, message: 'Not found' })
    }
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
  }
})

//  @route              PUT  /api/v2/staff-education/:id
//  @desc               Update staff education by id using formidable
//  @access             Private
router.put('/:id', JwtMiddleware.checkToken, async (req, res) => {
    try {
        const form = new formidable.IncomingForm()
        form.parse(req, async (error, fields, files) => {
            if (error) {
                return res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
            }
            let [rowsUpdated] = await staffEducation.update(fields, { where: { education_id: req.params.id } })
            if (rowsUpdated > 0) {
                let result = await staffEducation.findOne({ where: { education_id: req.params.id } })
                res.json({ result: constants.kResultOk, message: result })
            } else {
                res.json({ result: constants.kResultNok, message: 'Update failed, record not found or no new data.' })
            }
        })
    } catch (error) {
        res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
    }
})

//  @route              DELETE  /api/v2/staff-education/:id
//  @desc               Delete staff education by id
//  @access             Private
router.delete('/:id', JwtMiddleware.checkToken, async (req, res) => {
    try {
        const deleted = await staffEducation.destroy({ where: { education_id: req.params.id } })
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
