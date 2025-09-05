const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const document = require('../../models/sciences/document')
const Projects = require('../../models/sciences/project')
const Departments = require('../../models/sciences/department')
const constants = require('../../config/constant')
const JwtMiddleware = require('../../config/Jwt-Middleware')

//  @route              POST  /api/v2/document
//  @desc               Add document using formidable
//  @access             Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const form = new formidable.IncomingForm()
    form.parse(req, async (error, fields, files) => {
        if (error) {
            return res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
        }
        let result = await document.create(fields)
        res.json({ result: constants.kResultOk, message: result })
    })
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/document/list
//  @desc               List all documents
//  @access             Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await document.findAll(
      {
      include: [
        {model: Departments}, 
        {model: Projects}, 
      ],     
      // attributes: [ ['doc_id', 'id'], 'doc_id', 'doc_reference_no','date_received','doc_from','doc_to', 'subject','scopus_url'], 
      attributes: [ ['doc_id', 'id'], 'doc_id', 'doc_reference_no','date_received','doc_from','doc_to', 'subject']  
      }
    )    
    res.json({ result: constants.kResultOk, message: result })
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/document/:id
//  @desc               Get document by id
//  @access             Private
router.get('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await document.findOne({ where: { document_id: req.params.id } })
    if (result) {
      res.json({ result: constants.kResultOk, message: result })
    } else {
      res.json({ result: constants.kResultNok, message: 'Not found' })
    }
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
  }
})

//  @route              PUT  /api/v2/document/:id
//  @desc               Update document by id using formidable
//  @access             Private
router.put('/:id', JwtMiddleware.checkToken, async (req, res) => {
    try {
        const form = new formidable.IncomingForm()
        form.parse(req, async (error, fields, files) => {
            if (error) {
                return res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
            }
            let [rowsUpdated] = await document.update(fields, { where: { document_id: req.params.id } })
            if (rowsUpdated > 0) {
                let result = await document.findOne({ where: { document_id: req.params.id } })
                res.json({ result: constants.kResultOk, message: result })
            } else {
                res.json({ result: constants.kResultNok, message: 'Update failed, record not found or no new data.' })
            }
        })
    } catch (error) {
        res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
    }
})

//  @route              DELETE  /api/v2/document/:id
//  @desc               Delete document by id
//  @access             Private
router.delete('/:id', JwtMiddleware.checkToken, async (req, res) => {
    try {
        const deleted = await document.destroy({ where: { document_id: req.params.id } })
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
