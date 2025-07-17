const express = require('express')
const router = express.Router()
const publication = require('../../models/sciences/publication')
const constants = require('../../config/constant')
const JwtMiddleware = require('../../config/Jwt-Middleware')

//  @route              POST  /api/v2/publication
//  @desc               Add publication
//  @access             Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await publication.create(req.body)
    res.json({ result: constants.kResultOk, message: result })
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/publication/list
//  @desc               List all publications
//  @access             Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await publication.findAll()
    res.json({ result: constants.kResultOk, message: result })
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/publication/:id
//  @desc               Get publication by id
//  @access             Private
router.get('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await publication.findOne({ where: { pub_id: req.params.id } })
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