const express = require('express')
const Sequelize = require('sequelize')
const sequelize = require('../../config/db-instance')
const router = express.Router()

//  @route   GET /api/v2/dashboard6/list
//  @desc    Staff ตำแหน่งทางวิชาการ — list + summary charts
//  @access  Private
//
//  Query params:
//    page      (default 1)
//    limit     (default 10, max 100)
//    position  exact match เช่น "ผศ.ดร."
//    dept      exact match เช่น "ภาควิชาเคมี"
//    search    ILIKE ชื่อ-สกุล (ไทยหรืออังกฤษ)

router.get('/list', async (req, res) => {
  console.log('get dashboard6 list API called')

  try {
    // ── 1. Summary: จำนวนอาจารย์แยกตาม position ──────────────────────────────
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

    // ── 2. Summary: จำนวนอาจารย์แยกตาม position × department ────────────────
    const byPositionDeptRaw = await sequelize.query(
      `SELECT d.dept_name, s.position, COUNT(*) AS cnt
       FROM "Staff" s
       JOIN "Departments" d ON s.department_id = d.department_id
       WHERE s.stafftype_id = 1
         AND s.position IS NOT NULL AND s.position <> ''
       GROUP BY d.dept_name, s.position
       ORDER BY d.dept_name, s.position`,
      { type: Sequelize.QueryTypes.SELECT }
    )
    // pivot เป็น { dept_name, [position]: count, ... }
    const positionSet = [...new Set(byPositionDeptRaw.map(r => r.position))]
    const deptMap = {}
    byPositionDeptRaw.forEach(r => {
      if (!deptMap[r.dept_name]) deptMap[r.dept_name] = { dept: r.dept_name }
      deptMap[r.dept_name][r.position] = parseInt(r.cnt)
    })
    const byPositionDept = Object.values(deptMap)

    // ── 3. Staff list (pagination + filter) ──────────────────────────────────
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
          OR s.firstname  ILIKE :search OR s.lastname  ILIKE :search)`
      )
    }

    const whereClause = conditions.join(' AND ')

    const countResult = await sequelize.query(
      `SELECT COUNT(*) AS cnt
       FROM "Staff" s
       LEFT JOIN "Departments" d ON s.department_id = d.department_id
       WHERE ${whereClause}`,
      { replacements, type: Sequelize.QueryTypes.SELECT }
    )
    const total = parseInt(countResult[0].cnt) || 0

    const staffRows = await sequelize.query(
      `SELECT s.staff_id, s.title_th, s.firstname_th, s.lastname_th,
              s.firstname, s.lastname, s.position, s.education,
              s.email, s.phone_no, s.startdate,
              d.dept_name
       FROM "Staff" s
       LEFT JOIN "Departments" d ON s.department_id = d.department_id
       WHERE ${whereClause}
       ORDER BY d.dept_name, s.position, s.firstname_th
       LIMIT :limit OFFSET :offset`,
      { replacements, type: Sequelize.QueryTypes.SELECT }
    )

    const data = staffRows.map(r => ({
      staffId:     r.staff_id,
      titleTh:     r.title_th     || '',
      firstnameTh: r.firstname_th || '',
      lastnameTh:  r.lastname_th  || '',
      firstname:   r.firstname    || '',
      lastname:    r.lastname     || '',
      position:    r.position     || '',
      education:   r.education    || '',
      email:       r.email        || '',
      phoneNo:     r.phone_no     || '',
      startDate:   r.startdate    || null,
      dept:        r.dept_name    || ''
    }))

    res.status(200).json({
      status: 'ok',
      result: {
        summary: {
          byPosition,
          byPositionDept,
          positionKeys: positionSet
        },
        total,
        page,
        limit,
        data
      }
    })

  } catch (error) {
    res.status(500).json({
      status: 'nok',
      error: error.toString()
    })
  }
})

module.exports = router
