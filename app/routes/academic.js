const express = require('express')
const router = express.Router()
const sequelize = require('../../config/db-instance')
const { Sequelize, Op } = require('sequelize')
const AdmissionPlan = require('../../models/sciences/admissionPlan')
const AcademicProgram = require('../../models/sciences/academicProgram')
const Student = require('../../models/sciences/student')
const AcademicResearch = require('../../models/sciences/academicResearch')

// ─────────────────────────────────────────────────────────────────────────────
// ADMISSION PLAN CRUD
// ─────────────────────────────────────────────────────────────────────────────
router.get('/admission/list', async (req, res) => {
  try {
    var year = req.query.year ? parseInt(req.query.year) : null
    var where = year ? { academic_year: year } : {}
    var rows = await AdmissionPlan.findAll({
      where,
      include: [{ model: AcademicProgram, attributes: ['program_name', 'degree_level'] }],
      order: [['academic_year', 'DESC'], ['plan_id', 'ASC']],
    })
    var result = rows.map(function(r) {
      return {
        id: r.plan_id, plan_id: r.plan_id,
        academic_year: r.academic_year,
        program_name: r.AcademicProgram ? r.AcademicProgram.program_name : '',
        degree_level: r.AcademicProgram ? r.AcademicProgram.degree_level : '',
        planned_seats: r.planned_seats,
        actual_admitted: r.actual_admitted,
        group_name: r.group_name,
        eligible_count: r.eligible_count,
        admit_pct: r.admit_pct,
        program_id: r.program_id,
      }
    })
    res.json({ status: 'ok', result })
  } catch (e) { res.json({ status: 'nok', result: e.message }) }
})

router.get('/admission/:id', async (req, res) => {
  try {
    var row = await AdmissionPlan.findByPk(req.params.id, {
      include: [{ model: AcademicProgram, attributes: ['program_name', 'degree_level'] }]
    })
    if (!row) return res.json({ status: 'nok', result: 'Not found' })
    res.json({ status: 'ok', result: row })
  } catch (e) { res.json({ status: 'nok', result: e.message }) }
})

router.post('/admission', async (req, res) => {
  try {
    var r = req.body
    var row = await AdmissionPlan.create({
      program_id: r.program_id,
      academic_year: r.academic_year,
      planned_seats: r.planned_seats,
      actual_admitted: r.actual_admitted,
    })
    res.json({ status: 'ok', result: row })
  } catch (e) { res.json({ status: 'nok', result: e.message }) }
})

router.put('/admission/:id', async (req, res) => {
  try {
    var row = await AdmissionPlan.findByPk(req.params.id)
    if (!row) return res.json({ status: 'nok', result: 'Not found' })
    var r = req.body
    await row.update({
      program_id: r.program_id,
      academic_year: r.academic_year,
      planned_seats: r.planned_seats,
      actual_admitted: r.actual_admitted,
    })
    res.json({ status: 'ok', result: row })
  } catch (e) { res.json({ status: 'nok', result: e.message }) }
})

router.delete('/admission/:id', async (req, res) => {
  try {
    var row = await AdmissionPlan.findByPk(req.params.id)
    if (!row) return res.json({ status: 'nok', result: 'Not found' })
    await row.destroy()
    res.json({ status: 'ok', result: 'deleted' })
  } catch (e) { res.json({ status: 'nok', result: e.message }) }
})

// ─────────────────────────────────────────────────────────────────────────────
// ACADEMIC RESEARCH CRUD
// ─────────────────────────────────────────────────────────────────────────────
router.get('/research/list', async (req, res) => {
  try {
    var degree = req.query.degree || null
    var where = degree ? { degree_level: { [Op.iLike]: '%' + degree + '%' } } : {}
    var rows = await AcademicResearch.findAll({ where, order: [['research_id', 'DESC']] })
    var result = rows.map(function(r) { return Object.assign({ id: r.research_id }, r.dataValues) })
    res.json({ status: 'ok', result })
  } catch (e) { res.json({ status: 'nok', result: e.message }) }
})

router.get('/research/:id', async (req, res) => {
  try {
    var row = await AcademicResearch.findByPk(req.params.id)
    if (!row) return res.json({ status: 'nok', result: 'Not found' })
    res.json({ status: 'ok', result: row })
  } catch (e) { res.json({ status: 'nok', result: e.message }) }
})

router.post('/research', async (req, res) => {
  try {
    var r = req.body
    var row = await AcademicResearch.create({
      student_code: r.student_code || null,
      prefix: r.prefix || null,
      firstname: r.firstname || null,
      lastname: r.lastname || null,
      degree_level: r.degree_level || null,
      faculty: r.faculty || null,
      major_name: r.major_name || null,
      thesis_th: r.thesis_th || null,
      thesis_en: r.thesis_en || null,
      research_status: r.research_status || null,
      journal_name: r.journal_name || null,
      publish_type: r.publish_type || null,
    })
    res.json({ status: 'ok', result: row })
  } catch (e) { res.json({ status: 'nok', result: e.message }) }
})

router.put('/research/:id', async (req, res) => {
  try {
    var row = await AcademicResearch.findByPk(req.params.id)
    if (!row) return res.json({ status: 'nok', result: 'Not found' })
    var r = req.body
    await row.update({
      student_code: r.student_code || null,
      prefix: r.prefix || null,
      firstname: r.firstname || null,
      lastname: r.lastname || null,
      degree_level: r.degree_level || null,
      faculty: r.faculty || null,
      major_name: r.major_name || null,
      thesis_th: r.thesis_th || null,
      thesis_en: r.thesis_en || null,
      research_status: r.research_status || null,
      journal_name: r.journal_name || null,
      publish_type: r.publish_type || null,
    })
    res.json({ status: 'ok', result: row })
  } catch (e) { res.json({ status: 'nok', result: e.message }) }
})

router.delete('/research/:id', async (req, res) => {
  try {
    var row = await AcademicResearch.findByPk(req.params.id)
    if (!row) return res.json({ status: 'nok', result: 'Not found' })
    await row.destroy()
    res.json({ status: 'ok', result: 'deleted' })
  } catch (e) { res.json({ status: 'nok', result: e.message }) }
})

// POST /api/v2/academic/admission/bulk
router.post('/admission/bulk', async (req, res) => {
  try {
    var records = req.body
    if (!Array.isArray(records) || !records.length) return res.json({ status: 'nok', result: 'No data' })

    // find or create AcademicProgram by major_name, then upsert AdmissionPlan
    var count = 0
    for (var i = 0; i < records.length; i++) {
      var r = records[i]
      if (!r.major_name || !String(r.major_name).trim()) continue

      // find or create AcademicProgram by program_name + degree_level (สาขาเดียวกันต่างระดับถือเป็นคนละ record)
      var majorName = String(r.major_name).trim()
      var degreeLevel = r.level ? String(r.level).trim() : null
      var [prog] = await AcademicProgram.findOrCreate({
        where: { program_name: majorName, degree_level: degreeLevel },
        defaults: { department_id: null }
      })

      // upsert by program_id + academic_year + group_name
      var groupName = r.group ? String(r.group).trim() : null
      var existing = await AdmissionPlan.findOne({
        where: { program_id: prog.program_id, academic_year: r.academic_year, group_name: groupName }
      })
      var planData = {
        planned_seats: r.planned_seats != null ? parseInt(r.planned_seats) : null,
        actual_admitted: r.actual_admitted != null ? parseInt(r.actual_admitted) : null,
        group_name: groupName,
        eligible_count: r.eligible != null ? parseInt(r.eligible) : null,
        admit_pct: r.admit_pct != null ? parseFloat(r.admit_pct) : null,
      }
      if (existing) {
        await existing.update(planData)
      } else {
        await AdmissionPlan.create(Object.assign({ program_id: prog.program_id, academic_year: r.academic_year }, planData))
      }
      count++
    }
    res.json({ status: 'ok', count: count })
  } catch (e) {
    res.json({ status: 'nok', result: e.message })
  }
})

// POST /api/v2/academic/research/bulk — upsert วิจัย ป.โท / ป.เอก → AcademicResearch
router.post('/research/bulk', async (req, res) => {
  try {
    var records = req.body
    if (!Array.isArray(records) || !records.length) return res.json({ status: 'nok', result: 'No data' })

    var count = 0
    for (var i = 0; i < records.length; i++) {
      var r = records[i]
      if (!r.student_code) continue

      var whereClause = { student_code: String(r.student_code) }
      if (r.thesis_th) whereClause.thesis_th = r.thesis_th
      var existing = await AcademicResearch.findOne({ where: whereClause })
      var payload = {
        student_code: String(r.student_code),
        prefix: r.prefix || null,
        firstname: r.firstname || null,
        lastname: r.lastname || null,
        degree_level: r.degree_level || null,
        faculty: r.faculty || null,
        major_name: r.major_name || null,
        thesis_th: r.thesis_th || null,
        thesis_en: r.thesis_en || null,
        research_status: r.research_status || null,
        journal_name: r.journal_name || null,
        publish_type: r.publish_type || null,
      }
      if (existing) {
        await existing.update(payload)
      } else {
        await AcademicResearch.create(payload)
      }
      count++
    }
    res.json({ status: 'ok', count: count })
  } catch (e) {
    res.json({ status: 'nok', result: e.message })
  }
})

// POST /api/v2/academic/grant/bulk — upsert ทุนนำเสนอ
router.post('/grant/bulk', async (req, res) => {
  try {
    var records = req.body
    if (!Array.isArray(records) || !records.length) return res.json({ status: 'nok', result: 'No data' })

    var count = 0
    for (var i = 0; i < records.length; i++) {
      var r = records[i]
      if (!r.student_code) continue

      // find or create student
      var student = await Student.findOne({ where: { studentOfficial_id: String(r.student_code) } })
      if (!student) {
        student = await Student.create({
          studentOfficial_id: String(r.student_code),
          firstname: r.firstname || '',
          lastname: r.lastname || '',
          major_name: r.major_name || null,
          department_name: null,
          entry_year: null,
        })
      }

      // create grant record
      await StudentGrant.create({
        student_id: student.student_id,
        grant_name: r.topic || null,
        conference_name: r.conference_name || null,
        amount: r.amount || null,
        grant_type: r.grant_type || null,
        grant_source: r.program || null,
      })
      count++
    }
    res.json({ status: 'ok', count: count })
  } catch (e) {
    res.json({ status: 'nok', result: e.message })
  }
})

module.exports = router
