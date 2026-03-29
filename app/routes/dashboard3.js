const express = require('express')
const router = express.Router()
const sequelize = require('../../config/db-instance')
const { Sequelize } = require('sequelize')
const AdmissionPlan = require('../../models/sciences/admissionPlan')
const AcademicProgram = require('../../models/sciences/academicProgram')
const AcademicGrant = require('../../models/sciences/academicGrant')
const Publication = require('../../models/sciences/publication')

// GET /api/v2/dashboard3/summary?year=2567
router.get('/summary', async (req, res) => {
  try {
    var year = parseInt(req.query.year) || 2567

    // ── 1. KPI ───────────────────────────────────────────────────────────────
    var planRows = await AdmissionPlan.findAll({ where: { academic_year: year } })
    var totalPlan   = planRows.reduce(function(s, r) { return s + (r.planned_seats || 0) }, 0)
    var totalAdmit  = planRows.reduce(function(s, r) { return s + (r.actual_admitted || 0) }, 0)
    var reportPct   = totalPlan > 0 ? Math.round((totalAdmit / totalPlan) * 100) : 0
    var totalPublicationRows = await sequelize.query(
      `SELECT COUNT(*) AS cnt FROM "AcademicResearch"
       WHERE degree_level IN ('ปริญญาโท', 'ปริญญาเอก')`,
      { type: Sequelize.QueryTypes.SELECT }
    )
    var totalPublication = parseInt((totalPublicationRows[0] || {}).cnt || 0)
    var totalGrant   = await AcademicGrant.count()

    // ── 2. แผนรับ vs รายงานตัว แยกภาควิชา ──────────────────────────────────
    var apRows = await AdmissionPlan.findAll({
      where: { academic_year: year },
      include: [{ model: AcademicProgram, attributes: ['program_name', 'department_id'] }],
    })
    var deptMap = {}
    apRows.forEach(function(r) {
      var prog = r.AcademicProgram
      var d = prog ? prog.program_name : 'ไม่ระบุ'
      if (!deptMap[d]) deptMap[d] = { dept: d, plan: 0, reported: 0 }
      deptMap[d].plan     += (r.planned_seats || 0)
      deptMap[d].reported += (r.actual_admitted || 0)
    })
    var admissionByDept = Object.values(deptMap).slice(0, 8)

    // ── 3. แนวโน้มการรับนิสิต (รายปี) ───────────────────────────────────────
    var trendRows = await AdmissionPlan.findAll({
      attributes: [
        'academic_year',
        [Sequelize.fn('SUM', Sequelize.col('actual_admitted')), 'total'],
      ],
      group: ['academic_year'],
      order: [['academic_year', 'ASC']],
    })
    var admissionTrend = trendRows.map(function(r) {
      return { year: String(r.academic_year), total: parseInt(r.dataValues.total) || 0 }
    })

    // ── 4. ผลงานวิจัยสูงสุด แยกสาขา (top 5) จาก AcademicResearch ──────────────
    var majorRows = await sequelize.query(
      `SELECT major_name, COUNT(*) AS cnt FROM "AcademicResearch"
       WHERE major_name IS NOT NULL AND major_name != ''
       GROUP BY major_name ORDER BY cnt DESC LIMIT 5`,
      { type: Sequelize.QueryTypes.SELECT }
    )
    var topDepts = majorRows.map(function(r, i) {
      return { rank: i + 1, dept: r.major_name, count: parseInt(r.cnt) }
    })

    // ── 5. ผลงานวิจัย แยกระดับ ป.โท/ป.เอก (pie) จาก AcademicResearch ──────────
    var degreeRows = await sequelize.query(
      `SELECT degree_level, COUNT(*) AS cnt FROM "AcademicResearch"
       WHERE degree_level IS NOT NULL AND degree_level != ''
       GROUP BY degree_level ORDER BY cnt DESC`,
      { type: Sequelize.QueryTypes.SELECT }
    )
    var degreeTotal = degreeRows.reduce(function(s, r) { return s + parseInt(r.cnt) }, 0)
    var degreeShort = { 'ปริญญาโท': 'ป.โท', 'ปริญญาเอก': 'ป.เอก' }
    var studentByDept = degreeRows.map(function(r) {
      var short = degreeShort[r.degree_level] || r.degree_level
      return {
        id: short,
        label: short,
        value: degreeTotal > 0 ? parseFloat(((parseInt(r.cnt) / degreeTotal) * 100).toFixed(1)) : 0
      }
    })

    // ── 6. ทุนนำเสนอ แยกประเภท ───────────────────────────────────────────────
    var grantRows = await sequelize.query(
      `SELECT grant_type, COUNT(*) AS cnt FROM "AcademicGrants"
       WHERE grant_type IS NOT NULL GROUP BY grant_type ORDER BY cnt DESC`,
      { type: Sequelize.QueryTypes.SELECT }
    )
    var grantTotal = grantRows.reduce(function(s, r) { return s + parseInt(r.cnt) }, 0)
    var grantByType = grantRows.map(function(r) {
      return {
        id: r.grant_type,
        label: r.grant_type,
        value: grantTotal > 0 ? parseFloat(((parseInt(r.cnt) / grantTotal) * 100).toFixed(1)) : 0
      }
    })

    // ── 7. รายชื่อนิสิตได้รับทุนล่าสุด ───────────────────────────────────────
    var recentGrants = await AcademicGrant.findAll({
      order: [['grant_id', 'DESC']],
      limit: 5,
    })
    var recentGrantList = recentGrants.map(function(r) {
      return {
        student_code: r.student_code || '',
        name: (r.firstname || '') + ' ' + (r.lastname || ''),
        program: r.program || '',
        major: r.major_name || '',
        grant: r.grant_name || '',
      }
    })

    res.json({
      status: 'ok',
      result: {
        kpi: { totalAdmit, totalPlan, reportPct, totalPublication, totalGrant },
        admissionByDept,
        admissionTrend,
        studentByDept,
        grantByType,
        topDepts,
        recentGrantList,
        year,
      }
    })
  } catch (e) {
    res.json({ status: 'nok', result: e.message })
  }
})

// GET /api/v2/dashboard3/years
router.get('/years', async (req, res) => {
  try {
    var rows = await sequelize.query(
      `SELECT DISTINCT academic_year FROM "AdmissionPlans" ORDER BY academic_year DESC`,
      { type: Sequelize.QueryTypes.SELECT }
    )
    res.json({ status: 'ok', result: rows.map(function(r) { return r.academic_year }) })
  } catch (e) {
    res.json({ status: 'nok', result: e.message })
  }
})

module.exports = router
