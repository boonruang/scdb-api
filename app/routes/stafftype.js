const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const stafftype = require('../../models/sciences/stafftype')
const constants = require('../../config/constant')
const JwtMiddleware = require('../../config/Jwt-Middleware')

//  @route              GET  /api/v2/department/list
//  @desc               List all departments
//  @access             Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await stafftype.findAll(
      {
      attributes: [ ['stafftype_id', 'id'], 'stafftype_id', 'name',]   
      }
    )
    res.json({ status: constants.kResultOk, result: result })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

module.exports = router
