const express = require('express')
const publication = require('../../models/sciences/publication')
const ResearchAuthor = require('../../models/sciences/researchAuthor')
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

    const totalTeachers = await ResearchAuthor.count({ where: { staff_type: 'วิชาการ' } })

    // citations: sum docs_current_year จาก AuthorProfiles เฉพาะอาจารย์ที่มี paper ในปีนั้น
    const citationsResult = await sequelize.query(
      `SELECT COALESCE(SUM(ap.citations_current_year), 0) AS total
       FROM "AuthorProfiles" ap
       JOIN "ResearchAuthors" ra ON ra.spreadsheet_id = ap.spreadsheet_id
       JOIN "PublicationAuthors" pa ON pa.research_author_id = ra.research_author_id
       JOIN "Publications" p ON p.pub_id = pa.pub_id
       WHERE p.publication_year = :year`,
      { replacements: { year: ceYear }, type: Sequelize.QueryTypes.SELECT }
    )
    const citations = parseInt(citationsResult[0].total) || 0

    // hIndex: average h_index จากอาจารย์ที่มี paper ในปีนั้น
    const hIndexResult = await sequelize.query(
      `SELECT COALESCE(AVG(ap.h_index), 0) AS avg
       FROM "AuthorProfiles" ap
       JOIN "ResearchAuthors" ra ON ra.spreadsheet_id = ap.spreadsheet_id
       JOIN "PublicationAuthors" pa ON pa.research_author_id = ra.research_author_id
       JOIN "Publications" p ON p.pub_id = pa.pub_id
       WHERE p.publication_year = :year AND ap.h_index IS NOT NULL`,
      { replacements: { year: ceYear }, type: Sequelize.QueryTypes.SELECT }
    )
    const hIndex = Math.round(parseFloat(hIndexResult[0].avg) || 0)

    const pubTeacherResult = await sequelize.query(
      `SELECT COUNT(DISTINCT pa.research_author_id) AS cnt
       FROM "PublicationAuthors" pa
       JOIN "Publications" p ON pa.pub_id = p.pub_id
       WHERE p.publication_year = :year`,
      { replacements: { year: ceYear }, type: Sequelize.QueryTypes.SELECT }
    )
    const publishingTeachers = parseInt(pubTeacherResult[0].cnt) || 0

    const totalPubs = await publication.count({ where: { publication_year: ceYear } })

    // ── 2. scopusByYear (เฉพาะปีที่มีข้อมูล) ──────────────────────────────────

    const yearRows = await publication.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('publication_year')), 'yr']],
      where: { publication_year: { [Sequelize.Op.ne]: null } },
      order: [[Sequelize.col('publication_year'), 'ASC']],
      raw: true
    })
    const distinctYears = yearRows.map(r => r.yr).filter(y => y != null)

    const scopusByYear = await Promise.all(
      distinctYears.map(async (yr) => {
        const pubs = await publication.count({ where: { publication_year: yr, is_scopus: true } })
        const isiPubs = await publication.count({ where: { publication_year: yr, is_isi: true } })

        const teachersResult = await sequelize.query(
          `SELECT COUNT(DISTINCT pa.research_author_id) AS cnt
           FROM "PublicationAuthors" pa
           JOIN "Publications" p ON pa.pub_id = p.pub_id
           WHERE p.publication_year = :year`,
          { replacements: { year: yr }, type: Sequelize.QueryTypes.SELECT }
        )

        return {
          year:         String(yr + 543),
          publications: pubs,
          isi:          isiPubs,
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

    // ดึงจาก ResearchAuthors (ครอบคลุมทั้งสายวิชาการ + สนับสนุน) fallback ดึงจาก Publications
    let deptRows = await sequelize.query(
      `SELECT COALESCE(a.dept_name, 'ไม่ระบุ') AS dept_name, COUNT(DISTINCT pa.pub_id) AS cnt
       FROM "PublicationAuthors" pa
       JOIN "Publications" p      ON pa.pub_id = p.pub_id
       JOIN "ResearchAuthors" a   ON pa.research_author_id = a.research_author_id
       WHERE p.publication_year = :year
       GROUP BY COALESCE(a.dept_name, 'ไม่ระบุ')
       ORDER BY cnt DESC`,
      { replacements: { year: ceYear }, type: Sequelize.QueryTypes.SELECT }
    )

    if (deptRows.length === 0) {
      deptRows = await sequelize.query(
        `SELECT COALESCE(p.department, 'ไม่ระบุ') AS dept_name, COUNT(p.pub_id) AS cnt
         FROM "Publications" p
         WHERE p.publication_year = :year
         GROUP BY COALESCE(p.department, 'ไม่ระบุ')
         ORDER BY cnt DESC`,
        { replacements: { year: ceYear }, type: Sequelize.QueryTypes.SELECT }
      )
    }

    const deptTotal = deptRows.reduce((sum, r) => sum + parseInt(r.cnt), 0)
    const byDept = deptRows.map(r => ({
      id:    r.dept_name || 'ไม่ระบุ',
      label: r.dept_name || 'ไม่ระบุ',
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
      `SELECT a.research_author_id, a.firstname_th, a.lastname_th, a.title_th, a.dept_name,
              COUNT(pa.pub_id) AS cnt
       FROM "PublicationAuthors" pa
       JOIN "ResearchAuthors" a  ON pa.research_author_id = a.research_author_id
       JOIN "Publications" p     ON pa.pub_id = p.pub_id
       WHERE p.publication_year = :year
       GROUP BY a.research_author_id, a.firstname_th, a.lastname_th, a.title_th, a.dept_name
       ORDER BY cnt DESC
       LIMIT 10`,
      { replacements: { year: ceYear }, type: Sequelize.QueryTypes.SELECT }
    )

    const topAuthors = authorRows.map((r, idx) => ({
      rank:  idx + 1,
      name:  [r.title_th, r.firstname_th, r.lastname_th].filter(Boolean).join(' '),
      dept:  r.dept_name || '',
      count: parseInt(r.cnt)
    }))

    res.json({
      fiscalYear,
      kpi: { totalTeachers, citations, hIndex, publishingTeachers, totalPubs },
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
        CONCAT(a.firstname_th, ' ', a.lastname_th) ILIKE :search OR
        CONCAT(a.firstname, ' ', a.lastname) ILIKE :search OR
        a.dept_name ILIKE :search
      )`)
    }
    if (deptFilter) {
      replacements.deptFilter = deptFilter
      conditions.push('a.dept_name = :deptFilter')
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
       LEFT JOIN "ResearchAuthors" a      ON pa.research_author_id = a.research_author_id
       WHERE ${whereClause}`,
      { replacements, type: Sequelize.QueryTypes.SELECT }
    )
    const total = parseInt(countResult[0].cnt) || 0

    // ── Paginated list ───────────────────────────────────────────────────────

    const pubRows = await sequelize.query(
      `SELECT p.pub_id, p.title, p.journal_name, p.publication_year, p.quartile,
              MIN(a.research_author_id) AS first_author_id
       FROM "Publications" p
       LEFT JOIN "PublicationAuthors" pa ON p.pub_id = pa.pub_id
       LEFT JOIN "ResearchAuthors" a      ON pa.research_author_id = a.research_author_id
       WHERE ${whereClause}
       GROUP BY p.pub_id, p.title, p.journal_name, p.publication_year, p.quartile
       ORDER BY p.publication_year DESC, p.pub_id DESC
       LIMIT :limit OFFSET :offset`,
      { replacements, type: Sequelize.QueryTypes.SELECT }
    )

    // ── Batch-fetch author info ──────────────────────────────────────────────

    const authorIds = [...new Set(pubRows.map(r => r.first_author_id).filter(Boolean))]
    const authorMap = {}

    if (authorIds.length > 0) {
      const authors = await ResearchAuthor.findAll({
        where: { research_author_id: authorIds },
        attributes: ['research_author_id', 'firstname_th', 'lastname_th', 'title_th', 'dept_name']
      })
      authors.forEach(a => { authorMap[a.research_author_id] = a })
    }

    // ── Response ─────────────────────────────────────────────────────────────

    const data = pubRows.map(row => {
      const a = row.first_author_id ? authorMap[row.first_author_id] : null
      return {
        id:        row.pub_id,
        author:    a ? [a.title_th, a.firstname_th, a.lastname_th].filter(Boolean).join(' ') : '',
        dept:      a ? (a.dept_name || '') : '',
        title:     row.title,
        year:      row.publication_year,
        quartile:  row.quartile,
        journal:   row.journal_name,
        citations: 0
      }
    })

    res.json({ total, page, limit, data })

  } catch (error) {
    res.status(500).json({ error: true, message: error.toString() })
  }
})

module.exports = router
