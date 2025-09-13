const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const publication = require('../../models/sciences/publication')
const constants = require('../../config/constant')
const JwtMiddleware = require('../../config/Jwt-Middleware')

//  @route              POST  /api/v2/publication
//  @desc               Add publication using formidable
//  @access             Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('publication add is called')
  try {
    const form = new formidable.IncomingForm()
    form.parse(req, async (error, fields, files) => {
        if (error) {
            return res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
        }
        let result = await publication.create(fields)
        res.json({ status: constants.kResultOk, result: result })
    })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/publication/list
//  @desc               List all publications
//  @access             Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await publication.findAll(
      {
      attributes: [ ['pub_id', 'id'], 'pub_id', 'title','journal_name','publication_year','quartile', 'database_source']  
      }
    )    
    res.json({ status: constants.kResultOk, result: result })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/publication/:id
//  @desc               Get publication by id
//  @access             Private
router.get('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await publication.findOne(
      { 
      where: { pub_id: req.params.id },
      attributes: [ ['pub_id', 'id'], 'pub_id', 'title','journal_name','publication_year','quartile', 'database_source']    
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

//  @route              PUT  /api/v2/publication/:id
//  @desc               Update publication by id using formidable
//  @access             Private
router.put('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('publication edit is called')
    try {
        const form = new formidable.IncomingForm()
        form.parse(req, async (error, fields, files) => {
          const { pub_id, ...rest} = fields
            if (error) {
                return res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
            }
            let [rowsUpdated] = await publication.update(fields, { where: { pub_id: pub_id } })
            if (rowsUpdated > 0) {
                let result = await publication.findOne({ where: { pub_id: pub_id } })
                res.json({ status: constants.kResultOk, result: result })
            } else {
                res.json({ status: constants.kResultNok, result: 'Update failed, record not found or no new data.' })
            }
        })
    } catch (error) {
        res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
    }
})

//  @route              DELETE  /api/v2/publication/:id
//  @desc               Delete publication by id
//  @access             Private
router.delete('/:id', JwtMiddleware.checkToken, async (req, res) => {
  console.log('publication delete is called')
  console.log('param id ',req.params.id)
    try {
        const deleted = await publication.destroy({ where: { pub_id: req.params.id } })
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
