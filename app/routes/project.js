const express = require('express')
const router = express.Router()
const project = require('../../models/sciences/project')
const constants = require('../../config/constant')
const JwtMiddleware = require('../../config/Jwt-Middleware')
const department = require('../../models/sciences/department')

//  @route              POST  /api/v2/project
//  @desc               Add project
//  @access             Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await project.create(req.body)
    res.json({ result: constants.kResultOk, message: result })
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/project/list
//  @desc               List all projects
//  @access             Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await project.findAll({
      include: [
        {model: department}
      ]
    })
    res.json({ result: constants.kResultOk, message: result })
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/project/:id
//  @desc               Get project by id
//  @access             Private
router.get('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await project.findOne({ 
      where: { project_id: req.params.id }, 
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

module.exports = router