const express = require('express')
const router = express.Router()
const Sequelize = require('sequelize')
const sequelize = require('../../config/db-instance')
const Staff = require('../../models/sciences/staff')
const StaffEducation = require('../../models/sciences/staffEducation')
const StaffPositionHistory = require('../../models/sciences/staffPositionHistory')
const AcademicProgram = require('../../models/sciences/academicProgram')
const ProgramStaff = require('../../models/sciences/programStaff')
const { PROGRAM_ROLES } = require('../../models/sciences/programStaff')
const { linkAllResearchAuthors, normalizePositionNo } = require('../../utils/linkStaff')
const { upsertRows } = require('../../utils/upsertRows')
const { ROLES, requireRole } = require('../../config/Role-Middleware')
const constants = require('../../config/constant')
const JwtMiddleware = require('../../config/Jwt-Middleware')

// ข้อมูลบุคลากรที่เชื่อมกัน: ประวัติการศึกษา, ประวัติตำแหน่งวิชาการ, หลักสูตร + บทบาท, ผลงานวิจัย
// mount ที่ /api/v2/staffprofile

const ok = (res, body) => res.json({ status: constants.kResultOk, ...body })
const nok = (res, msg) => res.json({ status: constants.kResultNok, result: msg })

//  GET /programs/options — ตัวเลือกหลักสูตรและบทบาท สำหรับฟอร์ม
router.get('/programs/options', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const programs = await AcademicProgram.findAll({
      attributes: ['program_id', 'program_name', 'degree_level'],
      order: [['program_name', 'ASC'], ['degree_level', 'ASC']],
    })
    ok(res, { result: { programs, roles: PROGRAM_ROLES } })
  } catch (e) { nok(res, e.message) }
})

//  GET /program/:programId — บุคลากรในหลักสูตร พร้อมบทบาท
router.get('/program/:programId', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const rows = await sequelize.query(
      `SELECT ps.program_staff_id, ps.role, s.staff_id, s.title_th, s.firstname_th, s.lastname_th, s.position
       FROM "ProgramStaff" ps
       JOIN "Staff" s ON s.staff_id = ps.staff_id
       WHERE ps.program_id = :programId
       ORDER BY ps.role ASC, s.firstname_th ASC`,
      { replacements: { programId: parseInt(req.params.programId) || 0 }, type: Sequelize.QueryTypes.SELECT }
    )
    ok(res, { result: rows })
  } catch (e) { nok(res, e.message) }
})

//  POST /link-authors — จับคู่ผู้แต่งผลงานกับบุคลากรใหม่ทั้งตาราง (ด้วยเลขประจำตำแหน่ง)
router.post('/link-authors', JwtMiddleware.checkToken, async (req, res) => {
  try {
    ok(res, { result: await linkAllResearchAuthors() })
  } catch (e) { nok(res, e.message) }
})

// ── นำเข้าจาก Excel (ชีตใหม่ในไฟล์ 4 และ 5) ────────────────────────────────
// ทุกชีตอ้างบุคลากรด้วยเลขประจำตำแหน่ง แถวที่หาบุคลากรไม่เจอจะถูกข้ามและรายงานกลับ

async function staffIdMap() {
  const rows = await Staff.findAll({ attributes: ['staff_id', 'position_no'] })
  const map = {}
  rows.forEach((s) => { const k = normalizePositionNo(s.position_no); if (k) map[k] = s.staff_id })
  return map
}

function resolveStaff(records, map) {
  const ok = [], missing = new Set()
  records.forEach((r) => {
    const sid = map[normalizePositionNo(r.position_no)]
    if (sid) ok.push({ ...r, staff_id: sid })
    else missing.add(normalizePositionNo(r.position_no) || '(ว่าง)')
  })
  return { ok, missing: [...missing] }
}

const text = (v) => (v === null || v === undefined ? '' : String(v).trim())

//  POST /education/bulk — ชีต "ประวัติการศึกษา" key: บุคลากร + วุฒิ
router.post('/education/bulk', JwtMiddleware.checkToken, requireRole(ROLES.HR), async (req, res) => {
  try {
    if (!Array.isArray(req.body)) return nok(res, 'Body must be an array')
    const { ok: rows, missing } = resolveStaff(req.body, await staffIdMap())
    const data = rows.filter((r) => text(r.degree)).map((r) => ({
      staff_id: r.staff_id,
      level: text(r.level) || null,
      degree: text(r.degree),
      university: text(r.university) || null,
      year: parseInt(r.year) || null,
    }))
    const result = await upsertRows(StaffEducation, data, ['staff_id', 'degree'])
    ok(res, { ...result, staffNotFound: missing })
  } catch (e) { nok(res, e.message) }
})

//  POST /position/bulk — ชีต "ประวัติตำแหน่งวิชาการ" key: บุคลากร + ตำแหน่ง
router.post('/position/bulk', JwtMiddleware.checkToken, requireRole(ROLES.HR), async (req, res) => {
  try {
    if (!Array.isArray(req.body)) return nok(res, 'Body must be an array')
    const { ok: rows, missing } = resolveStaff(req.body, await staffIdMap())
    const data = rows.filter((r) => text(r.academic_position)).map((r) => ({
      staff_id: r.staff_id,
      academic_position: text(r.academic_position),
      field_of_study: text(r.field_of_study) || null,
      appointed_date: text(r.appointed_date) || null,
      order_no: text(r.order_no) || null,
    }))
    const result = await upsertRows(StaffPositionHistory, data, ['staff_id', 'academic_position'])
    ok(res, { ...result, staffNotFound: missing })
  } catch (e) { nok(res, e.message) }
})

//  POST /program/bulk — ชีต "อาจารย์ประจำหลักสูตร" จับหลักสูตรด้วย สาขา + ระดับ (ตรงกับที่ import แผนการรับสร้างไว้)
router.post('/program/bulk', JwtMiddleware.checkToken, requireRole(ROLES.Academic), async (req, res) => {
  try {
    if (!Array.isArray(req.body)) return nok(res, 'Body must be an array')
    const programs = await AcademicProgram.findAll({ attributes: ['program_id', 'program_name', 'degree_level'] })
    const pkey = (name, level) => text(name).replace(/\s+/g, ' ') + '|' + text(level)
    const pmap = {}
    programs.forEach((p) => { pmap[pkey(p.program_name, p.degree_level)] = p.program_id })

    const { ok: rows, missing } = resolveStaff(req.body, await staffIdMap())
    const programNotFound = new Set(), badRole = new Set()
    const data = []
    rows.forEach((r) => {
      const pid = pmap[pkey(r.program_name, r.degree_level)]
      if (!pid) { programNotFound.add(text(r.program_name) + ' (' + text(r.degree_level) + ')'); return }
      if (!PROGRAM_ROLES.includes(text(r.role))) { badRole.add(text(r.role)); return }
      data.push({ program_id: pid, staff_id: r.staff_id, role: text(r.role) })
    })
    // key รวม role ด้วย คนเดียวมีได้หลายบทบาท; แถวซ้ำทั้ง 3 ค่า = รายการเดิม
    const result = await upsertRows(ProgramStaff, data, ['program_id', 'staff_id', 'role'])
    ok(res, { ...result, staffNotFound: missing, programNotFound: [...programNotFound], badRole: [...badRole] })
  } catch (e) { nok(res, e.message) }
})

//  POST /position — เพิ่มประวัติตำแหน่งวิชาการ
router.post('/position', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const b = req.body || {}
    if (!b.staff_id || !String(b.academic_position || '').trim()) return nok(res, 'ต้องระบุบุคลากรและตำแหน่งวิชาการ')
    if (!(await Staff.findByPk(b.staff_id))) return nok(res, 'ไม่พบบุคลากร')
    const row = await StaffPositionHistory.create({
      staff_id: b.staff_id,
      academic_position: String(b.academic_position).trim(),
      field_of_study: b.field_of_study || null,
      appointed_date: b.appointed_date || null,
      order_no: b.order_no || null,
      note: b.note || null,
    })
    ok(res, { result: row })
  } catch (e) { nok(res, e.message) }
})

router.delete('/position/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const n = await StaffPositionHistory.destroy({ where: { history_id: req.params.id } })
    n ? ok(res, { result: 'Deleted' }) : nok(res, 'Not found')
  } catch (e) { nok(res, e.message) }
})

//  POST /program — ผูกบุคลากรเข้าหลักสูตรพร้อมบทบาท
router.post('/program', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const b = req.body || {}
    if (!b.staff_id || !b.program_id || !b.role) return nok(res, 'ต้องระบุบุคลากร หลักสูตร และบทบาท')
    if (!PROGRAM_ROLES.includes(b.role)) return nok(res, 'บทบาทไม่ถูกต้อง')
    if (!(await Staff.findByPk(b.staff_id))) return nok(res, 'ไม่พบบุคลากร')
    if (!(await AcademicProgram.findByPk(b.program_id))) return nok(res, 'ไม่พบหลักสูตร')
    const [row, created] = await ProgramStaff.findOrCreate({
      where: { staff_id: b.staff_id, program_id: b.program_id, role: b.role },
    })
    if (!created) return nok(res, 'บุคลากรมีบทบาทนี้ในหลักสูตรนี้อยู่แล้ว')
    ok(res, { result: row })
  } catch (e) { nok(res, e.message) }
})

router.delete('/program/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const n = await ProgramStaff.destroy({ where: { program_staff_id: req.params.id } })
    n ? ok(res, { result: 'Deleted' }) : nok(res, 'Not found')
  } catch (e) { nok(res, e.message) }
})

//  GET /:staffId — ทุกอย่างที่เชื่อมกับบุคลากรคนนี้
router.get('/:staffId', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const staffId = parseInt(req.params.staffId) || 0
    const select = (sql) => sequelize.query(sql, { replacements: { staffId }, type: Sequelize.QueryTypes.SELECT })

    const [education, positions, programs, publications, authors] = await Promise.all([
      StaffEducation.findAll({ where: { staff_id: staffId }, order: [['year', 'ASC']] }),
      StaffPositionHistory.findAll({ where: { staff_id: staffId }, order: [['appointed_date', 'ASC']] }),
      select(`SELECT ps.program_staff_id, ps.program_id, ps.role, ap.program_name, ap.degree_level
              FROM "ProgramStaff" ps JOIN "AcademicPrograms" ap ON ap.program_id = ps.program_id
              WHERE ps.staff_id = :staffId ORDER BY ap.program_name ASC, ps.role ASC`),
      // ผลงานยึดปีเผยแพร่ของผลงานเอง ไม่ผูกกับค่า h-index ปัจจุบันในโปรไฟล์
      select(`SELECT DISTINCT p.pub_id, p.title, p.journal_name, p.publication_year, p.quartile, p.database_source
              FROM "Publications" p
              JOIN "PublicationAuthors" pa ON pa.pub_id = p.pub_id
              JOIN "ResearchAuthors" ra ON ra.research_author_id = pa.research_author_id
              WHERE ra.staff_id = :staffId
              ORDER BY p.publication_year DESC, p.pub_id DESC`),
      select(`SELECT research_author_id, spreadsheet_id FROM "ResearchAuthors" WHERE staff_id = :staffId`),
    ])

    ok(res, { result: { education, positions, programs, publications, authorLinked: authors.length > 0 } })
  } catch (e) { nok(res, e.message) }
})

module.exports = router
