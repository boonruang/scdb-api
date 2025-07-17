const express = require('express')
const router = express.Router()
const publicationAuthor = require('../../models/sciences/publicationAuthor')
const constants = require('../../config/constant')
const JwtMiddleware = require('../../config/Jwt-Middleware')

//  @route              POST  /api/v2/publication-author
//  @desc               Add an author to a publication
//  @access             Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await publicationAuthor.create(req.body)
    res.json({ result: constants.kResultOk, message: result })
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/publication-author/list
//  @desc               List all publication-author relations
//  @access             Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await publicationAuthor.findAll()
    res.json({ result: constants.kResultOk, message: result })
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/publication-author/publication/:id
//  @desc               Get all authors for a given publication id
//  @access             Private
router.get('/publication/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await publicationAuthor.findAll({ where: { pub_id: req.params.id } })
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