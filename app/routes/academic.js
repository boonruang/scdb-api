const express = require('express')
const router = express.Router()
const sequelize = require('../../config/db-instance')
const { Sequelize } = require('sequelize')
const AdmissionPlan = require('../../models/sciences/admissionPlan')
const AcademicProgram = require('../../models/sciences/academicProgram')
const Student = require('../../models/sciences/student')
const StudentGrant = require('../../models/sciences/studentGrant')

// POST /api/v2/academic/admission/bulk
router.post('/admission/bulk', async (req, res) => {
  try {
    var records = req.body
    if (!Array.isArray(records) || !records.length) return res.json({ status: 'nok', result: 'No data' })

    // find or create AcademicProgram by major_name, then upsert AdmissionPlan
    var count = 0
    for (var i = 0; i < records.length; i++) {
      var r = records[i]
      if (!r.major_name && !r.dept_name) continue

      // find program by name
      var prog = await AcademicProgram.findOne({ where: { program_name: r.major_name } })
      if (!prog) {
        prog = await AcademicProgram.create({
          program_name: r.major_name,
          program_type: r.level || null,
          department_id: null,
        })
      }

      // upsert by program_id + academic_year
      var existing = await AdmissionPlan.findOne({
        where: { program_id: prog.program_id, academic_year: r.academic_year }
      })
      if (existing) {
        await existing.update({
          planned_seats: r.planned_seats,
          actual_admitted: r.actual_admitted,
        })
      } else {
        await AdmissionPlan.create({
          program_id: prog.program_id,
          academic_year: r.academic_year,
          planned_seats: r.planned_seats,
          actual_admitted: r.actual_admitted,
        })
      }
      count++
    }
    res.json({ status: 'ok', count: count })
  } catch (e) {
    res.json({ status: 'nok', result: e.message })
  }
})

// POST /api/v2/academic/research/bulk — upsert นิสิตวิจัย (ม.โท / ป.เอก)
router.post('/research/bulk', async (req, res) => {
  try {
    var records = req.body
    if (!Array.isArray(records) || !records.length) return res.json({ status: 'nok', result: 'No data' })

    var count = 0
    for (var i = 0; i < records.length; i++) {
      var r = records[i]
      if (!r.student_code) continue

      var existing = await Student.findOne({ where: { studentOfficial_id: String(r.student_code) } })
      var payload = {
        studentOfficial_id: String(r.student_code),
        firstname: r.firstname || '',
        lastname: r.lastname || '',
        major_name: r.major_name || null,
        department_name: r.faculty || null,
        entry_year: null,
      }
      if (existing) {
        await existing.update(payload)
      } else {
        await Student.create(payload)
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
