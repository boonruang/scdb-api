/**
 * seed-staff-rebuild.js
 *
 * ทางเลือก 1: Rebuild Staff table ใหม่ทั้งหมด
 *
 * Step 1: ลบ PublicationAuthors → Publications → Staff (cascade safe)
 * Step 2: INSERT Staff 201 คน จากไฟล์บุคลากร (ข้อมูลฝ่ายบุคลากรและวิเทศสัมพันธ์.xlsx)
 * Step 3: Patch citations/h_index/scopus_url จากไฟล์วิจัย โดย match ชื่อ ENG
 * Step 4: Re-INSERT Publications 288 รายการ
 * Step 5: Re-link PublicationAuthors โดย match spreadsheet_id (A1,A2,...) → staff_id ใหม่
 *
 * รัน: node scripts/seed-staff-rebuild.js
 */

const path       = require('path')
const XLSX       = require('xlsx')
const sequelize  = require('../config/db-instance')
const staffModel = require('../models/sciences/staff')

const FILE_HR      = path.join(__dirname, '../../docs/ข้อมูลฝ่ายบุคลากรและวิเทศสัมพันธ์.xlsx')
const FILE_RESEARCH = path.join(__dirname, '../../docs/ข้อมูลฝ่ายวิจัย_Auther_profile_support.xlsx')

// Department name → department_id (ไทย จากไฟล์บุคลากร)
const DEPT_MAP = {
  'ภาควิชาคณิตศาสตร์': 1,
  'ภาควิชาฟิสิกส์':    2,
  'ภาควิชาชีววิทยา':   3,
  'ภาควิชาเคมี':       4,
}
// Department name → department_id (อังกฤษ จากไฟล์วิจัย)
const DEPT_ENG_MAP = {
  'Mathematics': 1,
  'Physics':     2,
  'Biology':     3,
  'Chemistry':   4,
}
const DEPT_DEFAULT = 7

// stafftype
const TYPE_MAP = { 'อาจารย์': 1, 'สายสนับสนุน': 2 }

function excelDateToStr(val) {
  if (!val || typeof val !== 'number') return null
  try { return XLSX.SSF.format('yyyy-mm-dd', val) } catch { return null }
}

function cleanStr(v) {
  return v !== undefined && v !== null ? String(v).trim() : null
}

async function main() {
  await sequelize.authenticate()
  console.log('DB connected')
  await staffModel.sync({ force: false })

  // Ensure columns exist
  const ensureCols = [
    'ALTER TABLE "Staff" ADD COLUMN IF NOT EXISTS "title_th"    VARCHAR(20)',
    'ALTER TABLE "Staff" ADD COLUMN IF NOT EXISTS "firstname_th" VARCHAR(255)',
    'ALTER TABLE "Staff" ADD COLUMN IF NOT EXISTS "lastname_th"  VARCHAR(255)',
    'ALTER TABLE "Staff" ALTER COLUMN "firstname" DROP NOT NULL',
    'ALTER TABLE "Staff" ALTER COLUMN "lastname"  DROP NOT NULL',
  ]
  for (const sql of ensureCols) await sequelize.query(sql)
  console.log('Columns ensured')

  // ── Step 1: ล้างข้อมูลเก่า ────────────────────────────────────────────────
  console.log('\nStep 1: ล้างข้อมูลเก่า...')
  await sequelize.query('DELETE FROM "PublicationAuthors"')
  await sequelize.query('DELETE FROM "Publications"')
  await sequelize.query('DELETE FROM "Staff"')
  await sequelize.query('ALTER SEQUENCE "Staff_staff_id_seq" RESTART WITH 1')
  await sequelize.query('ALTER SEQUENCE "Publications_pub_id_seq" RESTART WITH 1')
  console.log('  ล้างเรียบร้อย')

  // ── Step 2: อ่านไฟล์บุคลากร ───────────────────────────────────────────────
  console.log('\nStep 2: INSERT Staff จากไฟล์บุคลากร...')
  const wbHR   = XLSX.readFile(FILE_HR)
  const wsHR   = wbHR.Sheets['ข้อมูลบุคคลากร']
  const rowsHR = XLSX.utils.sheet_to_json(wsHR, { header: 1, defval: '' })
  const hrData = rowsHR.slice(2).filter(r => r[0] !== '' && r[1] !== '')

  // cols: 0=position_no, 1=สถานะ, 2=title_th, 3=firstname_th, 4=lastname_th,
  //       5=firstname(ENG), 6=lastname(ENG), 7=position, 8=education,
  //       9=startdate, 10=birthday, 11=dept, 12=email, 13=phone_no

  // Bulk INSERT
  const hrValues = []
  const hrBind   = []
  let hi = 1
  for (const r of hrData) {
    const positionNo  = r[0] ? parseInt(String(r[0]).trim()) || null : null
    const stafftypeId = TYPE_MAP[cleanStr(r[1])] || null
    const titleTh     = cleanStr(r[2])
    const firstnameTh = cleanStr(r[3])
    const lastnameTh  = cleanStr(r[4])
    const firstname   = cleanStr(r[5]) || cleanStr(r[3]) // fallback ชื่อไทย
    const lastname    = cleanStr(r[6]) || cleanStr(r[4])
    const position    = cleanStr(r[7])
    const education   = cleanStr(r[8])
    const startDate   = excelDateToStr(r[9])
    const birthDate   = excelDateToStr(r[10])
    const deptName    = cleanStr(r[11])
    const email       = cleanStr(r[12])
    const phoneNo     = cleanStr(r[13])
    const deptId      = deptName ? (DEPT_MAP[deptName] || DEPT_DEFAULT) : null

    // bind order: positionNo,stafftypeId,titleTh,firstnameTh,lastnameTh,
    //             firstname,lastname,position,education,
    //             startDate(::date),birthDate(::date),deptId,email,phoneNo
    hrValues.push(
      `($${hi},$${hi+1},$${hi+2},$${hi+3},$${hi+4},$${hi+5},$${hi+6},$${hi+7},$${hi+8},$${hi+9}::date,$${hi+10}::date,$${hi+11},$${hi+12},$${hi+13})`
    )
    hrBind.push(
      positionNo, stafftypeId, titleTh, firstnameTh, lastnameTh,
      firstname, lastname, position, education,
      startDate, birthDate, deptId, email, phoneNo
    )
    hi += 14
  }

  const insertResult = await sequelize.query(
    `INSERT INTO "Staff"
       (position_no, stafftype_id, title_th, firstname_th, lastname_th,
        firstname, lastname, position, education,
        startdate, birthday, department_id, email, phone_no)
     VALUES ${hrValues.join(',')}
     RETURNING staff_id`,
    { bind: hrBind }
  )
  console.log(`  INSERT ${hrData.length} Staff`)

  // build map ชื่อไทย → staff_id จาก RETURNING + hrData (firstname_th + lastname_th)
  const staffThMap = {}
  insertResult[0].forEach((row, idx) => {
    const fn = cleanStr(hrData[idx][3]) || ''
    const ln = cleanStr(hrData[idx][4]) || ''
    if (fn && ln) staffThMap[`${fn} ${ln}`] = row.staff_id
  })

  // ── Step 3: Patch ข้อมูลวิจัย จากไฟล์วิจัย ────────────────────────────────
  console.log('\nStep 3: Patch ข้อมูลวิจัย (citations, h_index, scopus_url)...')
  const wbR  = XLSX.readFile(FILE_RESEARCH)

  // Author profile (อาจารย์) — sheet "Author profile"
  // cols: A=spreadsheet_id(A1...), B=เลขประจำตำแหน่ง, C=ตำแหน่งวิชาการ, D=รายชื่ออาจารย์(Thai),
  //       E=First Name, F=Last Name, G=ภาควิชา, H=Citations Total, I=Publications, J=H-index,
  //       K=Documents 2025, L=Citations 2025, M=Scopus URL, N=Scholar URL, O=URL รูป,
  //       P=ความเชี่ยวชาญ, Q=ความสนใจ, R=E-mail, S=โทรศัพท์, T=แหล่งทุน, U=จริยธรรม

  const patchSheet = (sheetName) => {
    const ws   = wbR.Sheets[sheetName]
    if (!ws) return []
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
    return rows.slice(1).filter(r => r[0] !== '' && r[3] !== '')
  }

  const academicRows = patchSheet('Author profile')
  const supportRows  = patchSheet('Author profile สายสนับสนุน')
  const allResearch  = [...academicRows, ...supportRows]

  // Header: ID(A), เลขประจำตำแหน่ง, ตำแหน่งวิชาการ, รายชื่ออาจารย์, First Name, Last Name,
  //         ภาควิชา, Citations Total, Publications, H-index, Documents 2025, Citations 2025,
  //         Scopus URL, Scholar URL, URL รูป, ความเชี่ยวชาญ, ความสนใจ, E-mail, โทรศัพท์,
  //         แหล่งทุน, จริยธรรม

  let patched = 0
  let notFound = 0
  // เก็บ map spreadsheet_id → staff_id สำหรับ PublicationAuthors
  const spreadsheetMap = {} // "A1" → staff_id

  for (const r of allResearch) {
    const spreadsheetId   = cleanStr(r[0])   // col A = A1, A2, ...
    const thaiFullname    = cleanStr(r[3])   // col D = รายชื่ออาจารย์ (Thai fullname)
    const deptEngName     = cleanStr(r[6])   // col G = ภาควิชา (ENG)
    const citationsTotal  = parseInt(r[7])   || 0
    const pubCount        = parseInt(r[8])   || 0
    const hIndex          = parseInt(r[9])   || 0
    const docsCurrent     = parseInt(r[10])  || 0
    const citCurrent      = parseInt(r[11])  || 0
    const scopusUrl       = cleanStr(r[12])
    const scholarUrl      = cleanStr(r[13])
    const photoUrl        = cleanStr(r[14])
    const expertise       = cleanStr(r[15])
    const interests       = cleanStr(r[16])
    const researchFund    = cleanStr(r[19])
    const ethicsLicense   = cleanStr(r[20])
    const departmentId    = deptEngName ? (DEPT_ENG_MAP[deptEngName] || DEPT_DEFAULT) : null

    if (!thaiFullname) { notFound++; continue }

    const staffId = staffThMap[thaiFullname]

    if (staffId) {
      await sequelize.query(
        `UPDATE "Staff" SET
           spreadsheet_id         = $1,
           citations_total        = $2,
           publications_count     = $3,
           h_index                = $4,
           docs_current_year      = $5,
           citations_current_year = $6,
           scopus_url             = $7,
           scholar_url            = $8,
           photo_url              = $9,
           expertise              = $10,
           interests              = $11,
           research_fund          = $12,
           ethics_license         = $13,
           department_id          = $15
         WHERE staff_id = $14`,
        { bind: [spreadsheetId, citationsTotal, pubCount, hIndex, docsCurrent,
                 citCurrent, scopusUrl, scholarUrl, photoUrl,
                 expertise, interests, researchFund, ethicsLicense, staffId, departmentId] }
      )
      spreadsheetMap[spreadsheetId] = staffId
      patched++
    } else {
      notFound++
    }
  }
  console.log(`  Patched: ${patched}, Not found: ${notFound}`)

  // ── Step 4: INSERT Publications ────────────────────────────────────────────
  console.log('\nStep 4: INSERT Publications...')
  const wsPaper = wbR.Sheets['Paper']
  const paperRows = XLSX.utils.sheet_to_json(wsPaper, { header: 1, defval: '' })
  // cols: 0=P_id, 1=ผู้แต่ง(TH), 2=ID(A), 3=ผู้แต่ง(ENG), 4=ชื่อเรื่อง, 5=สังกัด,
  //       6=ค.ศ., 7=ชื่อวารสาร, 8=ISSN, 9=DOI, 10=Scopus, 11=Q(Scopus),
  //       12=ISI, 13=Q(SCIE), 14=IF, 15=ร่วมกับ, 16=URL รูป
  const papers = paperRows.slice(1).filter(r => r[4] !== '')

  const pubValues = []
  const pubBind   = []
  let pi = 1
  const pubSpreadsheetIds = [] // เก็บ ID(A) ของแต่ละ paper

  for (const r of papers) {
    const title      = cleanStr(r[4]) || '-'
    const year       = parseInt(r[6]) || null
    const journal    = cleanStr(r[7])
    const issn       = cleanStr(r[8])
    const doi        = cleanStr(r[9])
    const isScopus   = r[10] === true || String(r[10]).toLowerCase() === 'true' || r[10] === 1
    const quartile   = cleanStr(r[11])
    const isIsi      = r[12] === true || String(r[12]).toLowerCase() === 'true' || r[12] === 1
    const qScie      = cleanStr(r[13])
    const impactFactor = parseFloat(r[14]) || null
    const collabType = cleanStr(r[15])
    const photoUrl   = cleanStr(r[16])
    const isInternational = collabType === 'ต่างประเทศ'
    const dbSource   = isScopus ? 'Scopus' : (isIsi ? 'ISI' : 'Other')
    const spreadId   = cleanStr(r[2]) // ID(A)

    pubValues.push(`($${pi},$${pi+1},$${pi+2},$${pi+3},$${pi+4},$${pi+5},$${pi+6},$${pi+7},$${pi+8},$${pi+9},$${pi+10},$${pi+11},$${pi+12})`)
    pubBind.push(title, year, journal, quartile, dbSource,
                 doi, issn, impactFactor, isScopus, isIsi, qScie,
                 collabType, isInternational)
    pubSpreadsheetIds.push(spreadId)
    pi += 13
  }

  let pubIdMap = {}
  if (pubValues.length > 0) {
    const pubResult = await sequelize.query(
      `INSERT INTO "Publications"
         (title, publication_year, journal_name, quartile, database_source,
          doi, issn, impact_factor, is_scopus, is_isi, q_scie,
          collab_type, is_international)
       VALUES ${pubValues.join(',')}
       RETURNING pub_id`,
      { bind: pubBind }
    )
    pubResult[0].forEach((row, idx) => {
      pubIdMap[idx] = row.pub_id
    })
    console.log(`  INSERT ${papers.length} Publications`)
  }

  // ── Step 5: INSERT PublicationAuthors ─────────────────────────────────────
  console.log('\nStep 5: INSERT PublicationAuthors...')
  const paValues = []
  const paBind   = []
  let ai = 1
  let linked = 0
  let unmatched = 0

  papers.forEach((r, idx) => {
    const spreadId = cleanStr(r[2])
    const pubId    = pubIdMap[idx]
    const staffId  = spreadsheetMap[spreadId]

    if (pubId && staffId) {
      paValues.push(`($${ai},$${ai+1})`)
      paBind.push(pubId, staffId)
      ai += 2
      linked++
    } else {
      unmatched++
    }
  })

  if (paValues.length > 0) {
    await sequelize.query(
      `INSERT INTO "PublicationAuthors" (pub_id, staff_id) VALUES ${paValues.join(',')}`,
      { bind: paBind }
    )
  }
  console.log(`  Linked: ${linked}, Unmatched: ${unmatched}`)

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n=== Rebuild สำเร็จ ===')
  const [s] = await sequelize.query('SELECT COUNT(*) AS cnt FROM "Staff"',              { type: 'SELECT' })
  const [p] = await sequelize.query('SELECT COUNT(*) AS cnt FROM "Publications"',       { type: 'SELECT' })
  const [a] = await sequelize.query('SELECT COUNT(*) AS cnt FROM "PublicationAuthors"', { type: 'SELECT' })
  console.log('Staff:               ', s.cnt)
  console.log('Publications:        ', p.cnt)
  console.log('PublicationAuthors:  ', a.cnt)

  // เช็ค patch coverage
  const [withResearch] = await sequelize.query(
    'SELECT COUNT(*) AS cnt FROM "Staff" WHERE h_index IS NOT NULL',
    { type: 'SELECT' }
  )
  console.log('Staff ที่มีข้อมูลวิจัย:', withResearch.cnt)

  process.exit(0)
}

main().catch(e => {
  console.error('Rebuild failed:', e.message)
  console.error(e)
  process.exit(1)
})
