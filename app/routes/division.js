const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const Division = require('../../models/sciences/division')
const Staff = require('../../models/sciences/staff')
const constants = require('../../config/constant')
const JwtMiddleware = require('../../config/Jwt-Middleware')

// GET /api/v2/division/list
router.get('/list', async (req, res) => {
  try {
    var result = await Division.findAll({ order: [['division_name', 'ASC']] })
    res.json({ status: constants.kResultOk, result: result })
  } catch (e) {
    res.json({ status: constants.kResultNok, result: e.message })
  }
})

// GET /api/v2/division/:id
router.get('/:id', async (req, res) => {
  try {
    var result = await Division.findOne({ where: { division_id: req.params.id } })
    if (result) res.json({ status: constants.kResultOk, result: result })
    else res.json({ status: constants.kResultNok, result: 'Not found' })
  } catch (e) {
    res.json({ status: constants.kResultNok, result: e.message })
  }
})

// POST /api/v2/division
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const form = new formidable.IncomingForm()
    form.parse(req, async function(err, fields) {
      if (err) return res.json({ status: constants.kResultNok, result: err.message })
      var result = await Division.create({ division_name: fields.division_name })
      res.json({ status: constants.kResultOk, result: result })
    })
  } catch (e) {
    res.json({ status: constants.kResultNok, result: e.message })
  }
})

// PUT /api/v2/division/:id
router.put('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const form = new formidable.IncomingForm()
    form.parse(req, async function(err, fields) {
      if (err) return res.json({ status: constants.kResultNok, result: err.message })
      var [n] = await Division.update({ division_name: fields.division_name }, { where: { division_id: req.params.id } })
      if (n > 0) {
        var result = await Division.findOne({ where: { division_id: req.params.id } })
        res.json({ status: constants.kResultOk, result: result })
      } else {
        res.json({ status: constants.kResultNok, result: 'Not found' })
      }
    })
  } catch (e) {
    res.json({ status: constants.kResultNok, result: e.message })
  }
})

// DELETE /api/v2/division/:id
router.delete('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    // set division_id = null ใน Staff ก่อนลบ
    await Staff.update({ division_id: null }, { where: { division_id: req.params.id } })
    var deleted = await Division.destroy({ where: { division_id: req.params.id } })
    if (deleted) res.json({ status: constants.kResultOk, result: 'Deleted' })
    else res.json({ status: constants.kResultNok, result: 'Not found' })
  } catch (e) {
    res.json({ status: constants.kResultNok, result: e.message })
  }
})

module.exports = router
