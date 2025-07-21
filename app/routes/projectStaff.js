const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const projectStaff = require('../../models/sciences/projectStaff')
const constants = require('../../config/constant')
const JwtMiddleware = require('../../config/Jwt-Middleware')

//  @route              POST  /api/v2/project-staff
//  @desc               Add staff to a project using formidable
//  @access             Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const form = new formidable.IncomingForm()
    form.parse(req, async (error, fields, files) => {
        if (error) {
            return res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
        }
        let result = await projectStaff.create(fields)
        res.json({ result: constants.kResultOk, message: result })
    })
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

//  @route              DELETE  /api/v2/project-staff
//  @desc               Remove staff from a project using formidable
//  @access             Private
router.delete('/', JwtMiddleware.checkToken, async (req, res) => {
    try {
        const form = new formidable.IncomingForm()
        form.parse(req, async (error, fields, files) => {
            if (error) {
                return res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
            }
            const { project_id, staff_id } = fields
            if (!project_id || !staff_id) {
                return res.json({ result: constants.kResultNok, message: 'project_id and staff_id are required.' })
            }
            const deleted = await projectStaff.destroy({ where: { project_id, staff_id } })
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
