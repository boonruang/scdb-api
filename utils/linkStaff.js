const Staff = require('../models/sciences/staff')
const ResearchAuthor = require('../models/sciences/researchAuthor')

// เชื่อมผู้แต่งผลงานวิจัย (ResearchAuthors) เข้ากับบุคลากร (Staff) ด้วยเลขประจำตำแหน่ง
// ไฟล์ Author profile ส่งเลขมาเป็นตัวเลข Excel (77.0) ส่วน Staff เก็บเป็น string ("77")
// จึงต้อง normalize ก่อนเทียบ

function normalizePositionNo(v) {
  if (v === null || v === undefined) return ''
  return String(v).trim().replace(/\.0+$/, '')
}

async function findStaffIdByPositionNo(positionNo) {
  const key = normalizePositionNo(positionNo)
  if (!key) return null
  const staff = await Staff.findOne({ where: { position_no: key }, attributes: ['staff_id'] })
  return staff ? staff.staff_id : null
}

// ไล่จับคู่ทั้งตาราง ใช้หลัง import บุคลากรหรือ Author profile (ลำดับ import ไหนก่อนก็ได้)
async function linkAllResearchAuthors() {
  const staffRows = await Staff.findAll({ attributes: ['staff_id', 'position_no'] })
  const staffMap = {}
  staffRows.forEach((s) => {
    const key = normalizePositionNo(s.position_no)
    if (key) staffMap[key] = s.staff_id
  })

  const authors = await ResearchAuthor.findAll({ attributes: ['research_author_id', 'position_no', 'staff_id'] })
  let linked = 0
  const unmatched = []
  for (const a of authors) {
    const staffId = staffMap[normalizePositionNo(a.position_no)] || null
    if (staffId) {
      linked++
      if (a.staff_id !== staffId) await a.update({ staff_id: staffId })
    } else {
      unmatched.push(a.research_author_id)
      if (a.staff_id !== null) await a.update({ staff_id: null })
    }
  }
  return { linked, unmatched: unmatched.length }
}

module.exports = { normalizePositionNo, findStaffIdByPositionNo, linkAllResearchAuthors }
