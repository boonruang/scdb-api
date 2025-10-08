const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const Publications = require('../../models/sciences/publication')
const Staff = require('../../models/sciences/staff')
const publicationAuthor = require('../../models/sciences/publicationAuthor')
const constants = require('../../config/constant')
const JwtMiddleware = require('../../config/Jwt-Middleware')

//  @route              POST  /api/v2/publication-author
//  @desc               Add an author to a publication using formidable
//  @access             Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const form = new formidable.IncomingForm()
    form.parse(req, async (error, fields, files) => {
        if (error) {
            return res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
        }
        let result = await publicationAuthor.create(fields)
        res.json({ result: constants.kResultOk, message: result })
    })
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/publicationauthor/list
//  @desc               List all publicationauthor relations
//  @access             Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await publicationAuthor.findAll(
      {
      include: [
        {model: Publications},
        {model: Staff},
      ],     
      attributes: [ ['pub_id', 'id'], 'pub_id', 'staff_id' ]  
      }
    )    
    res.json({ status: constants.kResultOk, result: result })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/publicationauthor/:id
//  @desc               Get all authors for a given publication id
//  @access             Private
router.get('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    // This route finds all author associations for a given publication ID.
    let result = await publicationAuthor.findAll({ where: { pub_id: req.params.id } })
    if (result && result.length > 0) {
      res.json({ status: constants.kResultOk, result: result })
    } else {
      res.json({ status: constants.kResultNok, result: 'No authors found for this publication' })
    }
  } catch (error) {
    res.json({ resstatuslt: constants.kResultNok, result: JSON.stringify(error) })
  }
})

//  @route              PUT  /api/v2/publicationauthor
//  @desc               Update a publicationuthor relation (Not applicable, but endpoint exists for consistency)
//  @access             Private
router.put('/', JwtMiddleware.checkToken, async (req, res) => {
    try {
        const form = new formidable.IncomingForm()
        form.parse(req, async (error, fields, files) => {
            if (error) {
                return res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
            }
            // For a junction table like this, there are no fields to update.
            // This endpoint can be used to confirm an association exists.
            const { pub_id, staff_id } = fields
            if (!pub_id || !staff_id) {
                return res.json({ result: constants.kResultNok, message: 'pub_id and staff_id are required.' })
            }
            const found = await publicationAuthor.findOne({ where: { pub_id, staff_id } })
            if (found) {
                 res.json({ result: constants.kResultOk, message: 'Association confirmed. No fields to update.' })
            } else {
                 res.json({ result: constants.kResultNok, message: 'Association not found.' })
            }
        })
    } catch (error) {
        res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
    }
})


//  @route              DELETE  /api/v2/publicationauthor
//  @desc               Remove an author from a publication using formidable
//  @access             Private
router.delete('/', JwtMiddleware.checkToken, async (req, res) => {
    try {
        const form = new formidable.IncomingForm()
        form.parse(req, async (error, fields, files) => {
            if (error) {
                return res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
            }
            const { pub_id, staff_id } = fields
            if (!pub_id || !staff_id) {
                return res.json({ result: constants.kResultNok, message: 'pub_id and staff_id are required.' })
            }
            const deleted = await publicationAuthor.destroy({ where: { pub_id, staff_id } })
            if (deleted) {
                res.json({ result: constants.kResultOk, message: 'Association deleted successfully.' })
            } else {
                res.json({ result: constants.kResultNok, message: 'Association not found.' })
            }
        })
    } catch (error) {
        res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
    }
})

module.exports = router
