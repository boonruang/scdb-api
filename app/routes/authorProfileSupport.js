const express = require('express')
const router = express.Router()
const AuthorProfileSupport = require('../../models/sciences/authorProfileSupport')
const ResearchAuthor = require('../../models/sciences/researchAuthor')
const JwtMiddleware = require('../../config/Jwt-Middleware')

async function syncResearchAuthor(r, staffType) {
  var raPayload = {
    staff_type:   staffType,
    title_th:     r.title_th || null,
    firstname_th: r.firstname_th || null,
    lastname_th:  r.lastname_th || null,
    firstname:    r.firstname || null,
    lastname:     r.lastname || null,
    position:     r.position || null,
    position_no:  r.position_no || null,
    dept_name:    r.dept_name || null,
  }
  if (r.spreadsheet_id) {
    var existing = await ResearchAuthor.findOne({ where: { spreadsheet_id: String(r.spreadsheet_id) } })
    if (existing) { await existing.update(raPayload) }
    else { await ResearchAuthor.create(Object.assign({ spreadsheet_id: String(r.spreadsheet_id) }, raPayload)) }
  }
}

function buildPayload(r) {
  return {
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
}

// GET /api/v2/authorprofilesupport/list
router.get('/list', async (req, res) => {
  try {
    var rows = await AuthorProfileSupport.findAll({ order: [['firstname_th', 'ASC']] })
    res.json({ status: 'ok', result: rows })
  } catch (e) { res.json({ status: 'nok', result: e.message }) }
})

// GET /api/v2/authorprofilesupport/:id
router.get('/:id', async (req, res) => {
  try {
    var row = await AuthorProfileSupport.findByPk(req.params.id)
    if (!row) return res.json({ status: 'nok', result: 'not found' })
    res.json({ status: 'ok', result: row })
  } catch (e) { res.json({ status: 'nok', result: e.message }) }
})

// POST /api/v2/authorprofilesupport
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  try {
    var row = await AuthorProfileSupport.create(buildPayload(req.body))
    res.json({ status: 'ok', result: row })
  } catch (e) { res.json({ status: 'nok', result: e.message }) }
})

// PUT /api/v2/authorprofilesupport/:id
router.put('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    var row = await AuthorProfileSupport.findByPk(req.params.id)
    if (!row) return res.json({ status: 'nok', result: 'not found' })
    await row.update(buildPayload(req.body))
    res.json({ status: 'ok', result: row })
  } catch (e) { res.json({ status: 'nok', result: e.message }) }
})

// DELETE /api/v2/authorprofilesupport/:id
router.delete('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    var row = await AuthorProfileSupport.findByPk(req.params.id)
    if (!row) return res.json({ status: 'nok', result: 'not found' })
    await row.destroy()
    res.json({ status: 'ok', result: 'deleted' })
  } catch (e) { res.json({ status: 'nok', result: e.message }) }
})

// POST /api/v2/authorprofilesupport/bulk — upsert by spreadsheet_id
router.post('/bulk', JwtMiddleware.checkToken, async (req, res) => {
  try {
    var records = req.body
    if (!Array.isArray(records) || records.length === 0)
      return res.json({ status: 'nok', result: 'No data' })
    var count = 0
    for (var i = 0; i < records.length; i++) {
      var r = records[i]
      if (!r.firstname_th && !r.firstname) continue
      var payload = buildPayload(r)
      if (r.spreadsheet_id) {
        var existing = await AuthorProfileSupport.findOne({ where: { spreadsheet_id: String(r.spreadsheet_id) } })
        if (existing) { await existing.update(payload) }
        else { await AuthorProfileSupport.create(payload) }
      } else {
        await AuthorProfileSupport.create(payload)
      }
      await syncResearchAuthor(r, 'สนับสนุน')
      count++
    }
    res.json({ status: 'ok', count: count })
  } catch (e) { res.json({ status: 'nok', result: e.message }) }
})

module.exports = router
