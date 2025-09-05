const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const admissionPlan = require('../../models/sciences/admissionPlan')
const AcademicPrograms = require('../../models/sciences/academicProgram')
const constants = require('../../config/constant')
const JwtMiddleware = require('../../config/Jwt-Middleware')

//  @route              POST  /api/v2/admission-plan
//  @desc               Add admission plan using formidable
//  @access             Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const form = new formidable.IncomingForm()
    form.parse(req, async (error, fields, files) => {
        if (error) {
            return res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
        }
        let result = await admissionPlan.create(fields)
        res.json({ status: constants.kResultOk, result: result })
    })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/admission-plan/list
//  @desc               List all admission plans
//  @access             Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await admissionPlan.findAll(
      {
      include: [
        {model: AcademicPrograms},
      ],     
      attributes: [ ['plan_id', 'id'], 'plan_id', 'academic_year','planned_seats','actual_admitted' ]  
      }
    )    
    res.json({ status: constants.kResultOk, result: result })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/admission-plan/:id
//  @desc               Get admission plan by id
//  @access             Private
router.get('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await admissionPlan.findOne({ where: { plan_id: req.params.id } })
    if (result) {
      res.json({ status: constants.kResultOk, result: result })
    } else {
      res.json({ status: constants.kResultNok, result: 'Not found' })
    }
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

//  @route              PUT  /api/v2/admission-plan/:id
//  @desc               Update admission plan by id using formidable
//  @access             Private
router.put('/:id', JwtMiddleware.checkToken, async (req, res) => {
    try {
        const form = new formidable.IncomingForm()
        form.parse(req, async (error, fields, files) => {
            if (error) {
                return res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
            }
            let [rowsUpdated] = await admissionPlan.update(fields, { where: { plan_id: req.params.id } })
            if (rowsUpdated > 0) {
                let result = await admissionPlan.findOne({ where: { plan_id: req.params.id } })
                res.json({ status: constants.kResultOk, result: result })
            } else {
                res.json({ status: constants.kResultNok, result: 'Update failed, record not found or no new data.' })
            }
        })
    } catch (error) {
        res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
    }
})

//  @route              DELETE  /api/v2/admission-plan/:id
//  @desc               Delete admission plan by id
//  @access             Private
router.delete('/:id', JwtMiddleware.checkToken, async (req, res) => {
    try {
        const deleted = await admissionPlan.destroy({ where: { plan_id: req.params.id } })
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
