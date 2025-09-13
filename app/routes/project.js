const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const project = require('../../models/sciences/project')
const department = require('../../models/sciences/department')
const constants = require('../../config/constant')
const JwtMiddleware = require('../../config/Jwt-Middleware')

//  @route              POST  /api/v2/project
//  @desc               Add project using formidable
//  @access             Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const form = new formidable.IncomingForm()
    form.parse(req, async (error, fields, files) => {
        if (error) {
            return res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
        }
        let result = await project.create(fields)
        res.json({ status: constants.kResultOk, result: result })
    })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
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
      ],
      attributes: [ ['project_id', 'id'], 'project_id', 'responsible_dept_id', 'project_name','project_type','start_date','end_date', 'budget_source','budget_amount','status' ]        
    })
    res.json({ status: constants.kResultOk, result: result })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
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
      ],
      attributes: [ ['project_id', 'id'], 'project_id', 'responsible_dept_id', 'project_name','project_type','start_date','end_date', 'budget_source','budget_amount','status' ]        
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

//  @route              PUT  /api/v2/project/:id
//  @desc               Update project by id using formidable
//  @access             Private
router.put('/', JwtMiddleware.checkToken, async (req, res) => {
    try {
        const form = new formidable.IncomingForm()
        form.parse(req, async (error, fields, files) => {
          const { project_id, ...rest } = fields
            if (error) {
                return res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
            }
            let [rowsUpdated] = await project.update(fields, { where: { project_id: project_id } })
            if (rowsUpdated > 0) {
                let result = await project.findOne({ where: { project_id: project_id } })
                res.json({ status: constants.kResultOk, result: result })
            } else {
                res.json({ status: constants.kResultNok, result: 'Update failed, record not found or no new data.' })
            }
        })
    } catch (error) {
        res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
    }
})

//  @route              DELETE  /api/v2/project/:id
//  @desc               Delete project by id
//  @access             Private
router.delete('/:id', JwtMiddleware.checkToken, async (req, res) => {
    try {
        const deleted = await project.destroy({ where: { project_id: req.params.id } })
        if (deleted) {
            res.json({ status: constants.kResultOk, result: 'Record deleted successfully.' })
        } else {
            res.json({ status: constants.kResultNok, result: 'Record not found.' })
        }
    } catch (error) {
        res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
    }
})

module.exports = router
