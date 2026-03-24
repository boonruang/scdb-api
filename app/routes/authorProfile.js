const express = require('express')
const router = express.Router()
const AuthorProfile = require('../../models/sciences/authorProfile')
const JwtMiddleware = require('../../config/Jwt-Middleware')

// GET /api/v2/authorprofile/list
router.get('/list', async (req, res) => {
  try {
    var rows = await AuthorProfile.findAll({ order: [['firstname_th', 'ASC']] })
    res.json({ status: 'ok', result: rows })
  } catch (e) { res.json({ status: 'nok', result: e.message }) }
})

// GET /api/v2/authorprofile/:id
router.get('/:id', async (req, res) => {
  try {
    var row = await AuthorProfile.findByPk(req.params.id)
    if (!row) return res.json({ status: 'nok', result: 'not found' })
    res.json({ status: 'ok', result: row })
  } catch (e) { res.json({ status: 'nok', result: e.message }) }
})

// POST /api/v2/authorprofile
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  try {
    var row = await AuthorProfile.create(req.body)
    res.json({ status: 'ok', result: row })
  } catch (e) { res.json({ status: 'nok', result: e.message }) }
})

// PUT /api/v2/authorprofile/:id
router.put('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    var row = await AuthorProfile.findByPk(req.params.id)
    if (!row) return res.json({ status: 'nok', result: 'not found' })
    await row.update(req.body)
    res.json({ status: 'ok', result: row })
  } catch (e) { res.json({ status: 'nok', result: e.message }) }
})

// DELETE /api/v2/authorprofile/:id
router.delete('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    var row = await AuthorProfile.findByPk(req.params.id)
    if (!row) return res.json({ status: 'nok', result: 'not found' })
    await row.destroy()
    res.json({ status: 'ok', result: 'deleted' })
  } catch (e) { res.json({ status: 'nok', result: e.message }) }
})

// POST /api/v2/authorprofile/bulk — upsert by spreadsheet_id
router.post('/bulk', JwtMiddleware.checkToken, async (req, res) => {
  try {
    var records = req.body
    if (!Array.isArray(records) || records.length === 0)
      return res.json({ status: 'nok', result: 'No data' })
    var upserted = 0
    for (var i = 0; i < records.length; i++) {
      var r = records[i]
      if (!r.firstname_th && !r.firstname) continue
      var payload = {
        spreadsheet_id:         r.spreadsheet_id || null,
        title_th:               r.title_th || null,
        firstname_th:           r.firstname_th || null,
        lastname_th:            r.lastname_th || null,
        firstname:              r.firstname || null,
        lastname:               r.lastname || null,
        position:               r.position || null,
        position_no:            r.position_no || null,
        dept_name:              r.dept_name || null,
        email:                  r.email || null,
        phone_no:               r.phone_no || null,
        photo_url:              r.photo_url || null,
        citations_total:        r.citations_total || null,
        publications_count:     r.publications_count || null,
        h_index:                r.h_index || null,
        docs_current_year:      r.docs_current_year || null,
        citations_current_year: r.citations_current_year || null,
        scopus_url:             r.scopus_url || null,
        scholar_url:            r.scholar_url || null,
        expertise:              r.expertise || null,
        interests:              r.interests || null,
        research_fund:          r.research_fund || null,
        ethics_license:         r.ethics_license || null,
      }
      if (r.spreadsheet_id) {
        var existing = await AuthorProfile.findOne({ where: { spreadsheet_id: String(r.spreadsheet_id) } })
        if (existing) { await existing.update(payload) }
        else { await AuthorProfile.create(payload) }
      } else {
        await AuthorProfile.create(payload)
      }
      upserted++
    }
    res.json({ status: 'ok', count: upserted })
  } catch (e) { res.json({ status: 'nok', result: e.message }) }
})

module.exports = router
