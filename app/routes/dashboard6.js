const express = require('express')
const Sequelize = require('sequelize')
const sequelize = require('../../config/db-instance')
const router = express.Router()

// shared helper: ดึง summary (byPosition, byPositionDept, positionKeys)
async function getSummary() {
  const byPositionRaw = await sequelize.query(
    `SELECT s.position, COUNT(*) AS cnt
     FROM "Staff" s
     WHERE s.stafftype_id = 1
       AND s.position IS NOT NULL AND s.position <> ''
     GROUP BY s.position
     ORDER BY cnt DESC`,
    { type: Sequelize.QueryTypes.SELECT }
  )
  const byPosition = byPositionRaw.map(r => ({
    position: r.position,
    count: parseInt(r.cnt)
  }))
  const positionKeys = byPosition.map(r => r.position)

  const byPositionDeptRaw = await sequelize.query(
    `SELECT d.dept_name AS department, s.position, COUNT(*) AS cnt
     FROM "Staff" s
     JOIN "Departments" d ON s.department_id = d.department_id
     WHERE s.stafftype_id = 1
       AND s.position IS NOT NULL AND s.position <> ''
     GROUP BY d.dept_name, s.position
     ORDER BY d.dept_name, s.position`,
    { type: Sequelize.QueryTypes.SELECT }
  )
  const deptMap = {}
  byPositionDeptRaw.forEach(r => {
    if (!deptMap[r.department]) deptMap[r.department] = { department: r.department }
    deptMap[r.department][r.position] = parseInt(r.cnt)
  })
  const byPositionDept = Object.values(deptMap)

  return { byPosition, byPositionDept, positionKeys }
}

//  @route   GET /api/v2/dashboard6/summary
//  @desc    สรุปตำแหน่งทางวิชาการ (charts only, ไม่มี list)
//  @access  Public
router.get('/summary', async (req, res) => {
  try {
    const summary = await getSummary()
    res.status(200).json({ status: 'ok', result: summary })
  } catch (error) {
    res.status(500).json({ status: 'nok', error: error.toString() })
  }
})

//  @route   GET /api/v2/dashboard6/list
//  @desc    รายชื่อบุคลากรสายวิชาการ + pagination + filter + summary
//  @access  Public
//
//  Query params:
//    page      (default 1)
//    limit     (default 10, max 100)
//    position  ชื่อเต็มภาษาไทย เช่น "ผู้ช่วยศาสตราจารย์"
//    dept      ชื่อภาควิชา เช่น "ภาควิชาเคมี"
//    search    ILIKE ชื่อ-สกุล (ไทยหรืออังกฤษ)
router.get('/list', async (req, res) => {
  try {
    const page       = Math.max(1, parseInt(req.query.page)  || 1)
    const limit      = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10))
    const offset     = (page - 1) * limit
    const posFilter  = (req.query.position || '').trim()
    const deptFilter = (req.query.dept     || '').trim()
    const search     = (req.query.search   || '').trim()

    const conditions   = ['s.stafftype_id = 1']
    const replacements = { limit, offset }

    if (posFilter) {
      replacements.posFilter = posFilter
      conditions.push('s.position = :posFilter')
    }
    if (deptFilter) {
      replacements.deptFilter = deptFilter
      conditions.push('d.dept_name = :deptFilter')
    }
    if (search) {
      replacements.search = `%${search}%`
      conditions.push(
        `(s.firstname_th ILIKE :search OR s.lastname_th ILIKE :search
          OR s.firstname  ILIKE :search OR s.lastname   ILIKE :search)`
      )
    }

    const whereClause = conditions.join(' AND ')

    const [countResult] = await sequelize.query(
      `SELECT COUNT(*) AS cnt
       FROM "Staff" s
       LEFT JOIN "Departments" d ON s.department_id = d.department_id
       WHERE ${whereClause}`,
      { replacements, type: Sequelize.QueryTypes.SELECT }
    )
    const total = parseInt(countResult.cnt) || 0

    const staffRows = await sequelize.query(
      `SELECT s.staff_id, s.title_th, s.firstname_th, s.lastname_th,
              s.firstname, s.lastname, s.position, s.education, s.email,
              d.dept_name
       FROM "Staff" s
       LEFT JOIN "Departments" d ON s.department_id = d.department_id
       WHERE ${whereClause}
       ORDER BY d.dept_name, s.position, s.firstname_th
       LIMIT :limit OFFSET :offset`,
      { replacements, type: Sequelize.QueryTypes.SELECT }
    )

    const staff = staffRows.map(r => ({
      id:        r.staff_id,
      name_th:   [r.title_th, r.firstname_th, r.lastname_th].filter(Boolean).join(' '),
      name_en:   [r.firstname, r.lastname].filter(Boolean).join(' '),
      position:  r.position  || '',
      dept:      r.dept_name || '',
      education: r.education || '',
      email:     r.email     || ''
    }))

    const summary = await getSummary()

    res.status(200).json({
      status: 'ok',
      result: {
        staff,
        total,
        byPositionDept: summary.byPositionDept,
        positionKeys:   summary.positionKeys
      }
    })

  } catch (error) {
    res.status(500).json({ status: 'nok', error: error.toString() })
  }
})

module.exports = router
