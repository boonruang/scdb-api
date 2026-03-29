const express = require('express')
const router = express.Router()
const AcademicGrant = require('../../models/sciences/academicGrant')

// GET /api/v2/academicgrant/list
router.get('/list', async (req, res) => {
  try {
    var rows = await AcademicGrant.findAll({ order: [['grant_id', 'DESC']] })
    var result = rows.map(function(r) {
      return Object.assign({ id: r.grant_id }, r.dataValues)
    })
    res.json({ status: 'ok', result: result })
  } catch (e) { res.json({ status: 'nok', result: e.message }) }
})

// GET /api/v2/academicgrant/:id
router.get('/:id', async (req, res) => {
  try {
    var row = await AcademicGrant.findByPk(req.params.id)
    if (!row) return res.json({ status: 'nok', result: 'Not found' })
    res.json({ status: 'ok', result: Object.assign({ id: row.grant_id }, row.dataValues) })
  } catch (e) { res.json({ status: 'nok', result: e.message }) }
})

// DELETE /api/v2/academicgrant/:id
router.delete('/:id', async (req, res) => {
  try {
    var row = await AcademicGrant.findByPk(req.params.id)
    if (!row) return res.json({ status: 'nok', result: 'Not found' })
    await row.destroy()
    res.json({ status: 'ok', result: 'deleted' })
  } catch (e) { res.json({ status: 'nok', result: e.message }) }
})

// POST /api/v2/academicgrant
router.post('/', async (req, res) => {
  try {
    var r = req.body
    var row = await AcademicGrant.create({
      student_code:    r.student_code    || null,
      prefix:          r.prefix          || null,
      firstname:       r.firstname       || null,
      lastname:        r.lastname        || null,
      program:         r.program         || null,
      major_name:      r.major_name      || null,
      grant_name:      r.grant_name      || null,
      conference_name: r.conference_name || null,
      amount:          r.amount          || null,
      grant_type:      r.grant_type      || null,
      grant_source:    r.grant_source    || null,
    })
    res.json({ status: 'ok', result: row })
  } catch (e) { res.json({ status: 'nok', result: e.message }) }
})

// PUT /api/v2/academicgrant/:id
router.put('/:id', async (req, res) => {
  try {
    var row = await AcademicGrant.findByPk(req.params.id)
    if (!row) return res.json({ status: 'nok', result: 'Not found' })
    var r = req.body
    await row.update({
      student_code:    r.student_code    || null,
      prefix:          r.prefix          || null,
      firstname:       r.firstname       || null,
      lastname:        r.lastname        || null,
      program:         r.program         || null,
      major_name:      r.major_name      || null,
      grant_name:      r.grant_name      || null,
      conference_name: r.conference_name || null,
      amount:          r.amount          || null,
      grant_type:      r.grant_type      || null,
      grant_source:    r.grant_source    || null,
    })
    res.json({ status: 'ok', result: row })
  } catch (e) { res.json({ status: 'nok', result: e.message }) }
})

// POST /api/v2/academicgrant/bulk
router.post('/bulk', async (req, res) => {
  try {
    var records = req.body
    if (!Array.isArray(records) || !records.length) return res.json({ status: 'nok', result: 'No data' })
    var toInsert = records.map(function(r) {
      return {
        student_code:    r.student_code    || null,
        prefix:          r.prefix          || null,
        firstname:       r.firstname       || null,
        lastname:        r.lastname        || null,
        program:         r.program         || null,
        major_name:      r.major_name      || null,
        grant_name:      r.grant_name      || null,
        conference_name: r.conference_name || null,
        amount:          r.amount          || null,
        grant_type:      r.grant_type      || null,
        grant_source:    r.grant_source    || null,
      }
    })
    await AcademicGrant.bulkCreate(toInsert)
    res.json({ status: 'ok', count: toInsert.length })
  } catch (e) { res.json({ status: 'nok', result: e.message }) }
})

module.exports = router
