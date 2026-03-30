const express = require('express')
const router = express.Router()
const staff = require('../../models/sciences/staff')
const Departments = require('../../models/sciences/department')
const Division = require('../../models/sciences/division')
const Stafftype = require('../../models/sciences/stafftype')
const constants = require('../../config/constant')
const JwtMiddleware = require('../../config/Jwt-Middleware')
const formidable = require('formidable')

//  @route              POST  /api/v2/staff
//  @desc               Add staff using formidable
//  @access             Private
const STAFF_ALLOWED_FIELDS = [
  'stafftype_id', 'department_id', 'division_id', 'position_no',
  'title_th', 'firstname_th', 'lastname_th',
  'firstname', 'lastname', 'position', 'education',
  'startdate', 'birthday', 'email', 'phone_no', 'office_location',
]
const INTEGER_FIELDS = ['stafftype_id', 'department_id', 'division_id']

router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const form = new formidable.IncomingForm()
    form.parse(req, async (error, fields) => {
      if (error) {
        return res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
      }
      // INTEGER_FIELDS defined at module level
      const allowed = {}
      STAFF_ALLOWED_FIELDS.forEach(f => {
        if (fields[f] === undefined) return
        var v = fields[f]
        if (v === 'null' || v === '' && INTEGER_FIELDS.includes(f)) {
          allowed[f] = null
        } else if (INTEGER_FIELDS.includes(f)) {
          allowed[f] = parseInt(v) || null
        } else {
          allowed[f] = v === 'null' ? null : v
        }
      })
      let result = await staff.create(allowed)
      res.json({ status: constants.kResultOk, result: result })
    })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/staff/list
//  @desc               List all staff
//  @access             Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  console.log('staff list is called')
  try {
    let result = await staff.findAll(
      {
      include: [
        {model: Departments},
        {model: Stafftype},
        {model: Division},
      ],
      attributes: [
        ['staff_id', 'id'], 'staff_id', 'spreadsheet_id',
        'stafftype_id', 'department_id', 'division_id',
        'position_no', 'title_th',
        'firstname_th', 'lastname_th',
        'firstname', 'lastname',
        'position', 'education',
        'startdate', 'birthday',
        'email', 'phone_no', 'office_location',
        'citations_total', 'publications_count', 'h_index',
        'docs_current_year', 'citations_current_year',
        'scopus_url', 'scholar_url', 'photo_url',
        'expertise', 'interests',
        'research_fund', 'ethics_license',
      ],
      order: [
        ['staff_id','DESC']
      ],
      }
    )
    res.json({ status: constants.kResultOk, result: result })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/staff/:id
//  @desc               Get staff by id
//  @access             Private
router.get('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await staff.findOne(
      { 
      where: { staff_id: req.params.id },
      include: [
        {model: Departments},
        {model: Stafftype},
        {model: Division},
      ],
      attributes: [
        ['staff_id', 'id'], 'staff_id', 'spreadsheet_id',
        'stafftype_id', 'department_id',
        'position_no', 'title_th',
        'firstname_th', 'lastname_th',
        'firstname', 'lastname',
        'position', 'education',
        'startdate', 'birthday',
        'email', 'phone_no', 'office_location',
        'citations_total', 'publications_count', 'h_index',
        'docs_current_year', 'citations_current_year',
        'scopus_url', 'scholar_url', 'photo_url',
        'expertise', 'interests',
        'research_fund', 'ethics_license',
      ],
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

//  @route              PUT  /api/v2/staff/:id
//  @desc               Update staff by id using formidable
//  @access             Private
router.put('/', JwtMiddleware.checkToken, async (req, res) => {
    console.log('staff update is called')
    try {
        const form = new formidable.IncomingForm() 
        form.parse(req, async (error, fields, files) => {

          const { staff_id, ...rest } = fields

            if (error) {
                return res.json({ result: constants.kResultNok, message: JSON.stringify(error) }) 
            }
            // INTEGER_FIELDS defined at module level
            const allowed = {}
            STAFF_ALLOWED_FIELDS.forEach(f => {
              if (fields[f] === undefined) return
              var v = fields[f]
              if (v === 'null' || v === '' && INTEGER_FIELDS.includes(f)) {
                allowed[f] = null
              } else if (INTEGER_FIELDS.includes(f)) {
                allowed[f] = parseInt(v) || null
              } else {
                allowed[f] = v === 'null' ? null : v
              }
            })
            let [rowsUpdated] = await staff.update(allowed, { where: { staff_id: staff_id } })
            if (rowsUpdated > 0) {
                let result = await staff.findOne({ where: { staff_id: staff_id } }) 
                res.json({ status: constants.kResultOk, result: result }) 
            } else {
                res.json({ status: constants.kResultNok, result: 'Update failed, record not found or no new data.' }) 
            }
        }) 
    } catch (error) {
        res.json({ status: constants.kResultNok, result: JSON.stringify(error) }) 
    }
}) 

//  @route              DELETE  /api/v2/staff/:id
//  @desc               Delete staff by id
//  @access             Private
router.delete('/:id', JwtMiddleware.checkToken, async (req, res) => {
    try {
        const deleted = await staff.destroy({ where: { staff_id: req.params.id } }) 
        if (deleted) {
            res.json({ status: constants.kResultOk, result: 'Record deleted successfully.' }) 
        } else {
            res.json({ status: constants.kResultNok, result: 'Record not found.' }) 
        }
    } catch (error) {
        res.json({ status: constants.kResultNok, result: JSON.stringify(error) }) 
    }
}) 

//  @route              POST  /api/v2/staff/bulkupdateprofile
//  @desc               Bulk update staff research profile (citations, h-index, etc.) matched by spreadsheet_id
//  @access             Private
router.post('/bulkupdateprofile', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const records = req.body
    if (!Array.isArray(records) || records.length === 0) {
      return res.json({ status: constants.kResultNok, result: 'No data provided' })
    }
    const PROFILE_FIELDS = [
      'title_th', 'firstname_th', 'lastname_th', 'firstname', 'lastname',
      'position', 'department_id',
      'citations_total', 'publications_count', 'h_index',
      'docs_current_year', 'citations_current_year',
      'scopus_url', 'scholar_url', 'photo_url',
      'expertise', 'interests', 'email', 'phone_no',
      'research_fund', 'ethics_license',
    ]
    let updated = 0, inserted = 0
    for (const rec of records) {
      const { spreadsheet_id, ...fields } = rec
      if (!spreadsheet_id) continue
      const allowed = {}
      PROFILE_FIELDS.forEach(f => { if (fields[f] !== undefined) allowed[f] = fields[f] })
      const [rows] = await staff.update(allowed, { where: { spreadsheet_id } })
      if (rows > 0) {
        updated++
      } else {
        // insert new if not found
        await staff.create({ spreadsheet_id, ...allowed })
        inserted++
      }
    }
    res.json({ status: constants.kResultOk, updated, inserted, total: records.length })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

// POST /api/v2/staff/bulk — upsert by position_no
router.post('/bulk', async (req, res) => {
  try {
    var records = req.body
    if (!Array.isArray(records) || records.length === 0) {
      return res.json({ status: constants.kResultNok, result: 'No data' })
    }
    var Division = require('../../models/sciences/division')
    var divs = await Division.findAll({ attributes: ['division_id', 'division_name'] })
    var divMap = {}
    divs.forEach(function(d) { if (d.division_name) divMap[d.division_name] = d.division_id })

    // auto-create divisions ที่มีใน Excel แต่ยังไม่มีใน DB
    var uniqueDivs = [...new Set(records.map(function(r) { return r.dept || '' }).filter(Boolean))]
    for (var di = 0; di < uniqueDivs.length; di++) {
      var dname = uniqueDivs[di]
      if (!divMap[dname]) {
        var created = await Division.findOrCreate({
          where: { division_name: dname },
          defaults: { division_name: dname }
        })
        divMap[dname] = created[0].division_id
      }
    }

    var upserted = 0
    for (var i = 0; i < records.length; i++) {
      var r = records[i]
      if (!r.position_no && !r.firstname_th && !r.firstname) continue
      var div_id = divMap[r.dept] || null
      var payload = {
        position_no: r.position_no || null,
        stafftype_id: r.status === 'อาจารย์' ? 1 : 2,
        title_th: r.title || null,
        firstname_th: r.firstname_th || null,
        lastname_th: r.lastname_th || null,
        firstname: r.firstname || '',
        lastname: r.lastname || '',
        position: r.position || null,
        education: r.education || null,
        startdate: r.startdate || null,
        birthday: r.birthday || null,
        email: r.email || null,
        phone_no: r.phone_no || null,
        division_id: div_id,
      }
      if (r.position_no) {
        var existing = await staff.findOne({ where: { position_no: String(r.position_no) } })
        if (existing) {
          await existing.update(payload)
        } else {
          await staff.create(payload)
        }
      } else {
        await staff.create(payload)
      }
      upserted++
    }
    res.json({ status: constants.kResultOk, count: upserted })
  } catch (e) {
    res.json({ status: constants.kResultNok, result: e.message })
  }
})

module.exports = router
