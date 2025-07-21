const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const department = require('../../models/sciences/department')
const constants = require('../../config/constant')
const JwtMiddleware = require('../../config/Jwt-Middleware')

//  @route              POST  /api/v2/department
//  @desc               Add department using formidable
//  @access             Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const form = new formidable.IncomingForm()
    form.parse(req, async (error, fields, files) => {
        if (error) {
            return res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
        }
        let result = await department.create(fields)
        res.json({ result: constants.kResultOk, message: result })
    })
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/department/list
//  @desc               List all departments
//  @access             Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await department.findAll()
    res.json({ result: constants.kResultOk, message: result })
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/department/:id
//  @desc               Get department by id
//  @access             Private
router.get('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await department.findOne({ where: { department_id: req.params.id } })
    if (result) {
      res.json({ result: constants.kResultOk, message: result })
    } else {
      res.json({ result: constants.kResultNok, message: 'Not found' })
    }
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
  }
})

//  @route              PUT  /api/v2/department/:id
//  @desc               Update department by id using formidable
//  @access             Private
router.put('/:id', JwtMiddleware.checkToken, async (req, res) => {
    try {
        const form = new formidable.IncomingForm()
        form.parse(req, async (error, fields, files) => {
            if (error) {
                return res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
            }
            let [rowsUpdated] = await department.update(fields, { where: { department_id: req.params.id } })
            if (rowsUpdated > 0) {
                let result = await department.findOne({ where: { department_id: req.params.id } })
                res.json({ result: constants.kResultOk, message: result })
            } else {
                res.json({ result: constants.kResultNok, message: 'Update failed, record not found or no new data.' })
            }
        })
    } catch (error) {
        res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
    }
})

//  @route              DELETE  /api/v2/department/:id
//  @desc               Delete department by id
//  @access             Private
router.delete('/:id', JwtMiddleware.checkToken, async (req, res) => {
    try {
        const deleted = await department.destroy({ where: { department_id: req.params.id } })
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
