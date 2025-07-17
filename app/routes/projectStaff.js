const express = require('express')
const router = express.Router()
const projectStaff = require('../../models/sciences/projectStaff')
const constants = require('../../config/constant')
const JwtMiddleware = require('../../config/Jwt-Middleware')

//  @route              POST  /api/v2/project-staff
//  @desc               Add staff to a project
//  @access             Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await projectStaff.create(req.body)
    res.json({ result: constants.kResultOk, message: result })
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/project-staff/list
//  @desc               List all project-staff relations
//  @access             Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await projectStaff.findAll()
    res.json({ result: constants.kResultOk, message: result })
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/project-staff/project/:id
//  @desc               Get all staff for a given project id
//  @access             Private
router.get('/project/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await projectStaff.findAll({ where: { project_id: req.params.id } })
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