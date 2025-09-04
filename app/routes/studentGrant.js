const express = require('express')
const router = express.Router()
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
            return res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
        }
        let result = await studentGrant.create(fields)
        res.json({ result: constants.kResultOk, message: result })
    })
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
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
      attributes: [ ['grant_id', 'id'], 'grant_id', 'student_id','grant_name','conference_name','amount' ]  
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
router.get('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await studentGrant.findOne(
      { 
      where: { grant_id: req.params.id },
      include: [
        {model: Students}
      ],    
      attributes: [ ['grant_id', 'id'], 'grant_id', 'student_id','grant_name','conference_name','amount' ]  
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
