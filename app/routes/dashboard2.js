const express = require('express')
const router = express.Router()
const sequelize = require('../../config/db-instance')
const { QueryTypes } = require('sequelize')
const student = require('../../models/sciences/student')
const studentAward = require('../../models/sciences/studentAward')
const studentGrant = require('../../models/sciences/studentGrant')
const studentActivity = require('../../models/sciences/studentActivity')
const { Op } = require('sequelize')

//  @route  GET /api/v2/dashboard2/summary
//  @desc   Student affairs executive dashboard data
//  @access Private (no token required for dashboard display)
router.get('/summary', async (req, res) => {
  try {
    var year     = req.query.year     ? parseInt(req.query.year) : null
    var grantType    = req.query.grantType    || null
    var activityType = req.query.activityType || null
    var dateFrom     = req.query.dateFrom     || null   // YYYY-MM-DD
    var dateTo       = req.query.dateTo       || null   // YYYY-MM-DD

    // ── build SQL fragments ───────────────────────────────────────────
    var studentConds = ["(department_name IS NOT NULL AND department_name != '')"]
    if (year) studentConds.push('entry_year = ' + year)

    var awardConds = ['award_date IS NOT NULL']
    if (dateFrom) awardConds.push("award_date >= '" + dateFrom + "'")
    if (dateTo)   awardConds.push("award_date <= '" + dateTo   + "'")

    var activityConds = ['start_date IS NOT NULL']
    if (activityType) activityConds.push("organizer = '" + activityType.replace(/'/g, "''") + "'")
    if (dateFrom) activityConds.push("start_date >= '" + dateFrom + "'")
    if (dateTo)   activityConds.push("start_date <= '" + dateTo   + "'")

    var grantConds = ['1=1']
    if (grantType) grantConds.push("grant_type = '" + grantType.replace(/'/g, "''") + "'")

    // ── KPI ──────────────────────────────────────────────────────────
    var studentWhere = {}
    if (year) studentWhere.entry_year = year

    var activityWhere = {}
    if (activityType) activityWhere.organizer = activityType

    var grantWhere = {}
    if (grantType) grantWhere.grant_type = grantType

    var totalStudents     = await student.count({ where: studentWhere })
    var totalActivities   = await studentActivity.count({ where: activityWhere })
    var internationalAwards = await studentAward.count({ where: { award_level: 'นานาชาติ' } })
    var totalGrantValueRow  = await studentGrant.sum('amount', { where: grantWhere }) || 0

    var awardStudentRows = await sequelize.query(
      'SELECT COUNT(DISTINCT student_id) AS cnt FROM "StudentAwards" WHERE ' + awardConds.join(' AND '),
      { type: QueryTypes.SELECT }
    )
    var studentsWithAwards = parseInt((awardStudentRows[0] || {}).cnt || 0)

    // ── นิสิตตามภาควิชา ───────────────────────────────────────────────
    var studentsByDepartment = await sequelize.query(
      'SELECT department_name AS department, COUNT(*) AS count FROM "Students" WHERE ' +
      studentConds.join(' AND ') + ' GROUP BY department_name ORDER BY count DESC',
      { type: QueryTypes.SELECT }
    )

    // ── Loan Donut (กยศ.) ─────────────────────────────────────────────
    var loanWhere = grantType ? "WHERE grant_type = '" + grantType.replace(/'/g, "''") + "' AND loan_status IS NOT NULL" : "WHERE loan_status IS NOT NULL"
    var loanRows = await sequelize.query(
      'SELECT loan_status, COUNT(*) AS cnt FROM "StudentGrants" ' + loanWhere + ' GROUP BY loan_status',
      { type: QueryTypes.SELECT }
    )
    var loanDonut = loanRows.map(function(r) {
      return { id: r.loan_status, label: r.loan_status, value: parseInt(r.cnt) }
    })

    // ── รางวัลตามปี (Thai year) ───────────────────────────────────────
    var awardYearRows = await sequelize.query(
      'SELECT EXTRACT(YEAR FROM award_date)::int AS yr, award_level, COUNT(*) AS cnt ' +
      'FROM "StudentAwards" WHERE ' + awardConds.join(' AND ') +
      ' GROUP BY yr, award_level ORDER BY yr',
      { type: QueryTypes.SELECT }
    )
    var yearMap = {}
    awardYearRows.forEach(function(r) {
      var yrNum = parseInt(r.yr)
      var thaiYear = yrNum > 2400 ? yrNum : yrNum + 543
      var y = String(thaiYear)
      if (!yearMap[y]) yearMap[y] = { year: y, 'ระดับชาติ': 0, 'นานาชาติ': 0 }
      yearMap[y][r.award_level] = parseInt(r.cnt)
    })
    var awardsByYear = Object.values(yearMap)

    // ── ประเภทของทุน ──────────────────────────────────────────────────
    var grantTypeRows = await sequelize.query(
      'SELECT grant_type AS type, COUNT(*) AS cnt, COALESCE(SUM(amount),0) AS total_value ' +
      'FROM "StudentGrants" WHERE grant_type IS NOT NULL GROUP BY grant_type ORDER BY total_value DESC',
      { type: QueryTypes.SELECT }
    )
    var grantsByType = grantTypeRows.map(function(r) {
      return { type: r.type, count: parseInt(r.cnt), value: parseFloat(r.total_value) }
    })

    // ── โครงการตามเดือน ───────────────────────────────────────────────
    var activityMonthRows = await sequelize.query(
      'SELECT EXTRACT(MONTH FROM start_date) AS month_num, COUNT(*) AS projects, ' +
      'COALESCE(SUM(participant_count),0) AS participants FROM "StudentActivities" ' +
      'WHERE ' + activityConds.join(' AND ') + ' GROUP BY month_num ORDER BY month_num',
      { type: QueryTypes.SELECT }
    )
    var monthNames = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
    var activitiesByMonth = activityMonthRows.map(function(r) {
      return {
        month: monthNames[parseInt(r.month_num) - 1] || String(r.month_num),
        projects: parseInt(r.projects),
        participants: parseInt(r.participants),
      }
    })

    // ── distinct organizer list สำหรับ dropdown ───────────────────────
    var organizerRows = await sequelize.query(
      "SELECT DISTINCT organizer FROM \"StudentActivities\" WHERE organizer IS NOT NULL AND organizer != '' ORDER BY organizer",
      { type: QueryTypes.SELECT }
    )
    var organizerList = organizerRows.map(function(r) { return r.organizer })

    // ── Top นิสิต ─────────────────────────────────────────────────────
    var topStudentRows = await sequelize.query(
      'SELECT s.student_id, s."studentOfficial_id", s.firstname, s.lastname, s.major_name, ' +
      'COUNT(DISTINCT a.award_id) AS award_count, COUNT(DISTINCT g.grant_id) AS grant_count ' +
      'FROM "Students" s ' +
      'LEFT JOIN "StudentAwards" a ON a.student_id = s.student_id ' +
      'LEFT JOIN "StudentGrants" g ON g.student_id = s.student_id ' +
      'GROUP BY s.student_id, s."studentOfficial_id", s.firstname, s.lastname, s.major_name ' +
      'HAVING COUNT(DISTINCT a.award_id) > 0 OR COUNT(DISTINCT g.grant_id) > 0 ' +
      'ORDER BY award_count DESC, grant_count DESC',
      { type: QueryTypes.SELECT }
    )
    // ดึง award + grant details สำหรับ top students
    var topIds = topStudentRows.map(function(r) { return r.student_id })
    var awardDetails = []
    var grantDetails = []
    if (topIds.length > 0) {
      var idList = topIds.join(',')
      awardDetails = await sequelize.query(
        'SELECT award_id, student_id, award_name, award_level, award_date FROM "StudentAwards" WHERE student_id IN (' + idList + ')',
        { type: QueryTypes.SELECT }
      )
      grantDetails = await sequelize.query(
        'SELECT grant_id, student_id, grant_name, amount, grant_type FROM "StudentGrants" WHERE student_id IN (' + idList + ')',
        { type: QueryTypes.SELECT }
      )
    }

    var topStudents = topStudentRows.map(function(r) {
      return {
        student_id: r.student_id,
        student_code: r.studentOfficial_id || r['studentOfficial_id'] || '',
        name: (r.firstname || '') + ' ' + (r.lastname || ''),
        major: r.major_name || '',
        awards: parseInt(r.award_count),
        grants: parseInt(r.grant_count),
        awardList: awardDetails.filter(function(a) { return String(a.student_id) === String(r.student_id) }),
        grantList: grantDetails.filter(function(g) { return String(g.student_id) === String(r.student_id) }),
      }
    })

    res.json({
      status: 'ok',
      result: {
        kpi: {
          totalStudents: totalStudents,
          studentsWithAwards: studentsWithAwards,
          internationalAwards: internationalAwards,
          totalGrantValue: totalGrantValueRow,
          totalActivities: totalActivities,
        },
        studentsByDepartment: studentsByDepartment.map(function(r) {
          return { department: r.department, count: parseInt(r.count) }
        }),
        loanDonut: loanDonut,
        awardsByYear: awardsByYear,
        grantsByType: grantsByType,
        activitiesByMonth: activitiesByMonth,
        topStudents: topStudents,
        organizerList: organizerList,
      }
    })
  } catch (error) {
    res.json({ status: 'nok', result: JSON.stringify(error) })
  }
})

// Keep old /list endpoint for backward compatibility
router.get('/list', async (req, res) => {
  res.redirect('/api/v2/dashboard2/summary')
})

module.exports = router
