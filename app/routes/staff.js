const express = require('express')
const router = express.Router()
const staff = require('../../models/sciences/staff')
const Departments = require('../../models/sciences/department')
const Stafftype = require('../../models/sciences/stafftype')
const constants = require('../../config/constant')
const JwtMiddleware = require('../../config/Jwt-Middleware')
const formidable = require('formidable')

//  @route              POST  /api/v2/staff
//  @desc               Add staff using formidable
//  @access             Private
const STAFF_ALLOWED_FIELDS = [
  'stafftype_id', 'department_id', 'position_no',
  'title_th', 'firstname_th', 'lastname_th',
  'firstname', 'lastname', 'position', 'education',
  'startdate', 'birthday', 'email', 'phone_no', 'office_location',
]

router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const form = new formidable.IncomingForm()
    form.parse(req, async (error, fields) => {
      if (error) {
        return res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
      }
      const allowed = {}
      STAFF_ALLOWED_FIELDS.forEach(f => { if (fields[f] !== undefined) allowed[f] = fields[f] })
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
      ],     
      attributes: [ ['staff_id', 'id'], 'staff_id', 'stafftype_id','department_id', 'firstname','lastname','position', 'position_no', 'education', 'startdate', 'birthday', 'email', 'office_location',],
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
      ],
      attributes: [ ['staff_id', 'id'], 'staff_id', 'stafftype_id','department_id', 'firstname','lastname','position', 'position_no', 'education', 'startdate', 'birthday', 'email', 'office_location',]   
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
            const allowed = {}
            STAFF_ALLOWED_FIELDS.forEach(f => { if (fields[f] !== undefined) allowed[f] = fields[f] })
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

module.exports = router
