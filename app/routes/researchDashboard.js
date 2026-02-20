const express = require('express')
const publication = require('../../models/sciences/publication')
const staff = require('../../models/sciences/staff')
const Sequelize = require('sequelize')
const sequelize = require('../../config/db-instance')
const router = express.Router()

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function currentBeYear() {
  return new Date().getFullYear() + 543
}

function toCe(beYear) {
  return beYear - 543
}

// ---------------------------------------------------------------------------
// GET /api/v2/dashboard/research/summary
// ---------------------------------------------------------------------------
router.get('/summary', async (req, res) => {
  try {
    const fiscalYear = parseInt(req.query.fiscalYear) || currentBeYear()
    const ceYear     = toCe(fiscalYear)
    const cePrevYear = ceYear - 1

    // ── 1. KPI ──────────────────────────────────────────────────────────────

    const totalTeachers = await staff.count({ where: { stafftype_id: 1 } })

    // citations: sum of citations_current_year from academic staff
    const citationsResult = await sequelize.query(
      `SELECT COALESCE(SUM(citations_current_year), 0) AS total
       FROM "Staff"
       WHERE stafftype_id = 1`,
      { type: Sequelize.QueryTypes.SELECT }
    )
    const citations = parseInt(citationsResult[0].total) || 0

    // hIndex: average h_index from academic staff (rounded)
    const hIndexResult = await sequelize.query(
      `SELECT COALESCE(AVG(h_index), 0) AS avg
       FROM "Staff"
       WHERE stafftype_id = 1 AND h_index IS NOT NULL`,
      { type: Sequelize.QueryTypes.SELECT }
    )
    const hIndex = Math.round(parseFloat(hIndexResult[0].avg) || 0)

    const pubTeacherResult = await sequelize.query(
      `SELECT COUNT(DISTINCT pa.staff_id) AS cnt
       FROM "PublicationAuthors" pa
       JOIN "Publications" p ON pa.pub_id = p.pub_id
       WHERE p.publication_year = :year`,
      { replacements: { year: ceYear }, type: Sequelize.QueryTypes.SELECT }
    )
    const publishingTeachers = parseInt(pubTeacherResult[0].cnt) || 0

    // ── 2. scopusByYear (5 ปีย้อนหลัง) ──────────────────────────────────────

    const scopusByYear = await Promise.all(
      Array.from({ length: 5 }, (_, i) => ceYear - 4 + i).map(async (yr) => {
        const pubs = await publication.count({ where: { publication_year: yr } })

        const teachersResult = await sequelize.query(
          `SELECT COUNT(DISTINCT pa.staff_id) AS cnt
           FROM "PublicationAuthors" pa
           JOIN "Publications" p ON pa.pub_id = p.pub_id
           WHERE p.publication_year = :year`,
          { replacements: { year: yr }, type: Sequelize.QueryTypes.SELECT }
        )

        return {
          year:         String(yr + 543),
          publications: pubs,
          teachers:     parseInt(teachersResult[0].cnt) || 0
        }
      })
    )

    // ── 3. byQuartile ────────────────────────────────────────────────────────

    const quartileRows = await publication.findAll({
      attributes: [
        'quartile',
        [Sequelize.fn('COUNT', Sequelize.col('pub_id')), 'count']
      ],
      where:  { publication_year: ceYear },
      group:  ['quartile'],
      order:  [['quartile', 'ASC']]
    })

    const byQuartile = quartileRows.map(g => ({
      quartile: g.quartile,
      count:    parseInt(g.dataValues.count)
    }))

    // ── 4. byDept ────────────────────────────────────────────────────────────

    const deptRows = await sequelize.query(
      `SELECT d.dept_name, COUNT(DISTINCT pa.pub_id) AS cnt
       FROM "PublicationAuthors" pa
       JOIN "Publications" p  ON pa.pub_id = p.pub_id
       JOIN "Staff" s         ON pa.staff_id = s.staff_id
       JOIN "Departments" d   ON s.department_id = d.department_id
       WHERE p.publication_year = :year
       GROUP BY d.department_id, d.dept_name
       ORDER BY cnt DESC`,
      { replacements: { year: ceYear }, type: Sequelize.QueryTypes.SELECT }
    )

    const deptTotal = deptRows.reduce((sum, r) => sum + parseInt(r.cnt), 0)
    const byDept = deptRows.map(r => ({
      id:    r.dept_name,
      label: r.dept_name,
      value: deptTotal > 0
        ? parseFloat(((parseInt(r.cnt) / deptTotal) * 100).toFixed(1))
        : 0
    }))

    // ── 5. byCollabType (collab_type ปีนี้ vs ปีก่อน) ───────────────────────

    const srcCurrentRows = await publication.findAll({
      attributes: [
        'collab_type',
        [Sequelize.fn('COUNT', Sequelize.col('pub_id')), 'count']
      ],
      where:  { publication_year: ceYear },
      group:  ['collab_type']
    })
    const srcPrevRows = await publication.findAll({
      attributes: [
        'collab_type',
        [Sequelize.fn('COUNT', Sequelize.col('pub_id')), 'count']
      ],
      where:  { publication_year: cePrevYear },
      group:  ['collab_type']
    })

    const collabMap = {}
    srcCurrentRows.forEach(g => {
      const key = g.collab_type || 'ไม่ระบุ'
      collabMap[key] = {
        type:        key,
        currentYear: parseInt(g.dataValues.count),
        prevYear:    0
      }
    })
    srcPrevRows.forEach(g => {
      const key = g.collab_type || 'ไม่ระบุ'
      if (collabMap[key]) {
        collabMap[key].prevYear = parseInt(g.dataValues.count)
      } else {
        collabMap[key] = {
          type:        key,
          currentYear: 0,
          prevYear:    parseInt(g.dataValues.count)
        }
      }
    })
    const byCollabType = Object.values(collabMap)

    // ── 6. topAuthors (Top 10 ตลอดกาล) ──────────────────────────────────────

    const authorRows = await sequelize.query(
      `SELECT s.staff_id, s.firstname, s.lastname, s.position,
              d.dept_name, COUNT(pa.pub_id) AS cnt
       FROM "PublicationAuthors" pa
       JOIN "Staff" s         ON pa.staff_id = s.staff_id
       LEFT JOIN "Departments" d ON s.department_id = d.department_id
       GROUP BY s.staff_id, s.firstname, s.lastname, s.position, d.dept_name
       ORDER BY cnt DESC
       LIMIT 10`,
      { type: Sequelize.QueryTypes.SELECT }
    )

    const topAuthors = authorRows.map((r, idx) => ({
      rank:  idx + 1,
      name:  [r.position, r.firstname, r.lastname].filter(Boolean).join(' '),
      dept:  r.dept_name || '',
      count: parseInt(r.cnt)
    }))

    res.json({
      fiscalYear,
      kpi: { totalTeachers, citations, hIndex, publishingTeachers },
      scopusByYear,
      byQuartile,
      byDept,
      byCollabType,
      topAuthors
    })

  } catch (error) {
    res.status(500).json({ error: true, message: error.toString() })
  }
})

// ---------------------------------------------------------------------------
// GET /api/v2/dashboard/research/publications
// ---------------------------------------------------------------------------
router.get('/publications', async (req, res) => {
  try {
    const fiscalYear     = parseInt(req.query.fiscalYear) || currentBeYear()
    const ceYear         = toCe(fiscalYear)
    const search         = (req.query.search   || '').trim()
    const deptFilter     = (req.query.dept     || '').trim()
    const quartileFilter = (req.query.quartile || '').trim()
    const page           = Math.max(1, parseInt(req.query.page)  || 1)
    const limit          = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20))
    const offset         = (page - 1) * limit

    // ── Build WHERE clause ───────────────────────────────────────────────────

    const conditions   = ['p.publication_year = :ceYear']
    const replacements = { ceYear, limit, offset }

    if (search) {
      replacements.search = `%${search}%`
      conditions.push(`(
        p.title ILIKE :search OR
        CONCAT(s.firstname, ' ', s.lastname) ILIKE :search OR
        d.dept_name ILIKE :search
      )`)
    }
    if (deptFilter) {
      replacements.deptFilter = deptFilter
      conditions.push('d.dept_name = :deptFilter')
    }
    if (quartileFilter) {
      replacements.quartileFilter = quartileFilter
      conditions.push('p.quartile = :quartileFilter')
    }

    const whereClause = conditions.join(' AND ')

    // ── Total count ──────────────────────────────────────────────────────────

    const countResult = await sequelize.query(
      `SELECT COUNT(DISTINCT p.pub_id) AS cnt
       FROM "Publications" p
       LEFT JOIN "PublicationAuthors" pa ON p.pub_id = pa.pub_id
       LEFT JOIN "Staff" s              ON pa.staff_id = s.staff_id
       LEFT JOIN "Departments" d        ON s.department_id = d.department_id
       WHERE ${whereClause}`,
      { replacements, type: Sequelize.QueryTypes.SELECT }
    )
    const total = parseInt(countResult[0].cnt) || 0

    // ── Paginated list ───────────────────────────────────────────────────────

    const pubRows = await sequelize.query(
      `SELECT p.pub_id, p.title, p.journal_name, p.publication_year, p.quartile,
              MIN(s.staff_id) AS first_staff_id
       FROM "Publications" p
       LEFT JOIN "PublicationAuthors" pa ON p.pub_id = pa.pub_id
       LEFT JOIN "Staff" s              ON pa.staff_id = s.staff_id
       LEFT JOIN "Departments" d        ON s.department_id = d.department_id
       WHERE ${whereClause}
       GROUP BY p.pub_id, p.title, p.journal_name, p.publication_year, p.quartile
       ORDER BY p.publication_year DESC, p.pub_id DESC
       LIMIT :limit OFFSET :offset`,
      { replacements, type: Sequelize.QueryTypes.SELECT }
    )

    // ── Batch-fetch author info ──────────────────────────────────────────────

    const staffIds = [...new Set(pubRows.map(r => r.first_staff_id).filter(Boolean))]
    const staffMap = {}

    if (staffIds.length > 0) {
      const staffRows = await sequelize.query(
        `SELECT s.staff_id, s.firstname, s.lastname, s.position, d.dept_name
         FROM "Staff" s
         LEFT JOIN "Departments" d ON s.department_id = d.department_id
         WHERE s.staff_id IN (:staffIds)`,
        { replacements: { staffIds }, type: Sequelize.QueryTypes.SELECT }
      )
      staffRows.forEach(s => { staffMap[s.staff_id] = s })
    }

    // ── Response ─────────────────────────────────────────────────────────────

    const data = pubRows.map(row => {
      const a = row.first_staff_id ? staffMap[row.first_staff_id] : null
      return {
        id:        row.pub_id,
        author:    a ? [a.position, a.firstname, a.lastname].filter(Boolean).join(' ') : '',
        dept:      a ? (a.dept_name || '') : '',
        title:     row.title,
        year:      row.publication_year,
        quartile:  row.quartile,
        journal:   row.journal_name,
        citations: 0   // TODO: เพิ่ม citations column ใน Publications table
      }
    })

    res.json({ total, page, limit, data })

  } catch (error) {
    res.status(500).json({ error: true, message: error.toString() })
  }
})

module.exports = router
