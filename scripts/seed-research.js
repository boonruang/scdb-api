/**
 * seed-research.js  (bulk insert version)
 * Run: node scripts/seed-research.js
 */

require('dotenv').config()
const xlsx      = require('xlsx')
const { Sequelize } = require('sequelize')
const sequelize = require('../config/db-instance')

const EXCEL_PATH = 'D:/680612_science_msu/docs/ข้อมูลฝ่ายวิจัย_Auther_profile_support.xlsx'

const DEPT_MAP = { Biology: 3, Chemistry: 4, Physics: 2, Mathematics: 1 }
const DEPT_DEFAULT = 7  // "ไม่ระบุ" — fallback เมื่อ dept ไม่ตรง

const toInt  = v => (v == null || v === '') ? null : parseInt(v)
const toFlt  = v => (v == null || v === '') ? null : parseFloat(v)
const toBool = v => v === 1 || v === true
const toStr  = v => (v == null || v === '') ? null : String(v).trim()

async function addCol(table, col, def) {
  await sequelize.query(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS ${col} ${def}`)
}

async function main() {
  await sequelize.authenticate()
  console.log('✅ DB connected')

  // ── STEP 1: ADD COLUMNS ──────────────────────────────────────────────────
  console.log('\n[1] Adding columns...')
  await addCol('Staff', 'spreadsheet_id',         'VARCHAR(20)')
  await addCol('Staff', 'citations_total',         'INTEGER')
  await addCol('Staff', 'publications_count',      'INTEGER')
  await addCol('Staff', 'h_index',                 'INTEGER')
  await addCol('Staff', 'docs_current_year',       'INTEGER')
  await addCol('Staff', 'citations_current_year',  'INTEGER')
  await addCol('Staff', 'scopus_url',              'TEXT')
  await addCol('Staff', 'scholar_url',             'TEXT')
  await addCol('Staff', 'photo_url',               'TEXT')
  await addCol('Staff', 'expertise',               'TEXT')
  await addCol('Staff', 'interests',               'TEXT')
  await addCol('Staff', 'research_fund',           'TEXT')
  await addCol('Staff', 'ethics_license',          'VARCHAR(100)')
  await addCol('Publications', 'spreadsheet_id',   'VARCHAR(20)')
  await addCol('Publications', 'doi',              'TEXT')
  await addCol('Publications', 'issn',             'VARCHAR(50)')
  await addCol('Publications', 'impact_factor',    'FLOAT')
  await addCol('Publications', 'is_scopus',        'BOOLEAN DEFAULT FALSE')
  await addCol('Publications', 'is_isi',           'BOOLEAN DEFAULT FALSE')
  await addCol('Publications', 'q_scie',           'VARCHAR(20)')
  await addCol('Publications', 'collab_type',      'VARCHAR(30)')
  await addCol('Publications', 'is_international', 'BOOLEAN DEFAULT FALSE')
  await addCol('Publications', 'photo_url',        'TEXT')
  // Drop NOT NULL constraints ที่อาจมีจาก migration เดิม
  await sequelize.query(`ALTER TABLE "Staff" ALTER COLUMN "department_id" DROP NOT NULL`)
  await sequelize.query(`ALTER TABLE "Staff" ALTER COLUMN "stafftype_id"  DROP NOT NULL`)
  await sequelize.query(`ALTER TABLE "Publications" ALTER COLUMN "quartile"        DROP NOT NULL`)
  await sequelize.query(`ALTER TABLE "Publications" ALTER COLUMN "database_source" DROP NOT NULL`)
  console.log('   ✅ Done')

  // ── STEP 2: CLEAR OLD DATA ───────────────────────────────────────────────
  console.log('\n[2] Clearing old data...')
  await sequelize.query(`DELETE FROM "PublicationAuthors"`)
  await sequelize.query(`DELETE FROM "Publications"`)
  await sequelize.query(`DELETE FROM "Staff"`)
  await sequelize.query(`ALTER SEQUENCE IF EXISTS "Staff_staff_id_seq" RESTART WITH 1`)
  await sequelize.query(`ALTER SEQUENCE IF EXISTS "Publications_pub_id_seq" RESTART WITH 1`)
  console.log('   ✅ Done')

  // ── STEP 3: READ EXCEL ───────────────────────────────────────────────────
  console.log('\n[3] Reading Excel...')
  const wb      = xlsx.readFile(EXCEL_PATH)
  const authors  = xlsx.utils.sheet_to_json(wb.Sheets['Author profile'])
  const supports = xlsx.utils.sheet_to_json(wb.Sheets['Author profile สายสนับสนุน'])
  const papers   = xlsx.utils.sheet_to_json(wb.Sheets['Paper'])
  console.log(`   Authors: ${authors.length}, Support: ${supports.length}, Papers: ${papers.length}`)

  // ── STEP 4: BUILD STAFF ROWS ─────────────────────────────────────────────
  console.log('\n[4] Inserting Staff...')

  const toStaffRow = (row, stafftypeId) => [
    toStr(row['ID(A)']),
    toStr(row['First Name']) || '',
    toStr(row['Last Name'])  || '',
    toStr(row['ตำแหน่งวิชาการ']),
    DEPT_MAP[toStr(row['ภาควิชา'])] || DEPT_DEFAULT,
    stafftypeId,
    toStr(row['E-mail ']),
    toStr(row['โทรศัพท์']),
    toInt(row['Citations Total']),
    toInt(row['Publications']),
    toInt(row['H-index']),
    toInt(row['Documents 2025']),
    toInt(row['Citations 2025']),
    toStr(row['Scopus ลิ้งค์ข้อมูล Author profile']),
    toStr(row['scholar ลิ้งค์ข้อมูล Author profile']),
    toStr(row['URL รูป']),
    toStr(row['ความเชี่ยวชาญ']),
    toStr(row['ความสนใจ']),
    toStr(row['แหล่งทุนวิจัยที่ได้รับ']),
    toStr(row['จริยธรรมการวิจัย (เลขที่ใบอนุญาต)']),
  ]

  const allStaff = [
    ...authors.map(r => toStaffRow(r, 1)),
    ...supports.map(r => toStaffRow(r, 2)),
  ].filter(r => r[0]) // กรอง row ที่ไม่มี spreadsheet_id

  // Bulk insert Staff in one query
  const staffCols = `(spreadsheet_id, firstname, lastname, position,
    department_id, stafftype_id, email, phone_no,
    citations_total, publications_count, h_index,
    docs_current_year, citations_current_year,
    scopus_url, scholar_url, photo_url,
    expertise, interests, research_fund, ethics_license)`

  const staffPlaceholders = allStaff.map((_, i) => {
    const b = i * 20
    return `($${b+1},$${b+2},$${b+3},$${b+4},$${b+5},$${b+6},$${b+7},$${b+8},$${b+9},$${b+10},$${b+11},$${b+12},$${b+13},$${b+14},$${b+15},$${b+16},$${b+17},$${b+18},$${b+19},$${b+20})`
  }).join(',')

  const staffValues = allStaff.flat()

  const [staffResult] = await sequelize.query(
    `INSERT INTO "Staff" ${staffCols} VALUES ${staffPlaceholders} RETURNING staff_id, spreadsheet_id`,
    { bind: staffValues, type: Sequelize.QueryTypes.INSERT }
  )

  // Build spreadsheet_id → staff_id map
  const staffIdMap = {}
  staffResult.forEach(r => { staffIdMap[r.spreadsheet_id] = r.staff_id })
  console.log(`   ✅ Inserted ${staffResult.length} staff`)

  // ── STEP 5: INSERT PUBLICATIONS ──────────────────────────────────────────
  console.log('\n[5] Inserting Publications...')

  const validPapers = papers.filter(r =>
    toStr(r['ชื่อเรื่อง']) && toStr(r['ชื่อวารสาร']) && toInt(r['ค.ศ.'])
  )

  const pubRows = validPapers.map(row => {
    const isScopus = toBool(row['Scopus'])
    const isIsi    = toBool(row['ISI'])
    const isIntl   = toBool(row['ต่างปนะเทศ']) || toStr(row['ร่วมกับ']) === 'ต่างประเทศ'
    let dbSource   = 'Other'
    if (isScopus) dbSource = 'Scopus'
    else if (isIsi) dbSource = 'ISI'

    return [
      toStr(row['คอลัมน์ 1']),
      toStr(row['ชื่อเรื่อง']),
      toStr(row['ชื่อวารสาร']),
      toInt(row['ค.ศ.']),
      toStr(row['Q (Scopus)']),
      dbSource,
      toStr(row['DOI ']),
      toStr(row['ISSN']),
      toFlt(row['IF']),
      isScopus,
      isIsi,
      toStr(row['Q (SCIE)']),
      toStr(row['ร่วมกับ']),
      isIntl,
      toStr(row['URL รูป (ตีพิมพ์)']),
      toStr(row['ID(A)']),  // keep for link building
    ]
  })

  const pubCols = `(spreadsheet_id, title, journal_name, publication_year,
    quartile, database_source,
    doi, issn, impact_factor,
    is_scopus, is_isi, q_scie,
    collab_type, is_international, photo_url)`

  const pubPlaceholders = pubRows.map((_, i) => {
    const b = i * 15
    return `($${b+1},$${b+2},$${b+3},$${b+4},$${b+5},$${b+6},$${b+7},$${b+8},$${b+9},$${b+10},$${b+11},$${b+12},$${b+13},$${b+14},$${b+15})`
  }).join(',')

  // flatten without the author ID (last element)
  const pubValues = pubRows.map(r => r.slice(0, 15)).flat()

  const [pubResult] = await sequelize.query(
    `INSERT INTO "Publications" ${pubCols} VALUES ${pubPlaceholders} RETURNING pub_id, spreadsheet_id`,
    { bind: pubValues, type: Sequelize.QueryTypes.INSERT }
  )
  console.log(`   ✅ Inserted ${pubResult.length} publications`)

  // ── STEP 6: INSERT PUBLICATIONAUTHORS ────────────────────────────────────
  console.log('\n[6] Inserting PublicationAuthors...')

  // Build pub spreadsheet_id → pub_id map
  const pubIdMap = {}
  pubResult.forEach(r => { pubIdMap[r.spreadsheet_id] = r.pub_id })

  const links = []
  validPapers.forEach((row, i) => {
    const pid  = pubResult[i]?.pub_id
    const sid  = staffIdMap[toStr(row['ID(A)'])]
    if (pid && sid) links.push([pid, sid])
  })

  if (links.length > 0) {
    const linkPlaceholders = links.map((_, i) => `($${i*2+1},$${i*2+2})`).join(',')
    await sequelize.query(
      `INSERT INTO "PublicationAuthors" (pub_id, staff_id) VALUES ${linkPlaceholders}`,
      { bind: links.flat(), type: Sequelize.QueryTypes.INSERT }
    )
  }
  console.log(`   ✅ Inserted ${links.length} author links`)
  console.log(`   ⚠️  Unmatched: ${validPapers.length - links.length}`)

  // ── SUMMARY ──────────────────────────────────────────────────────────────
  const [sc] = await sequelize.query(`SELECT COUNT(*) AS cnt FROM "Staff"`,             { type: Sequelize.QueryTypes.SELECT })
  const [pc] = await sequelize.query(`SELECT COUNT(*) AS cnt FROM "Publications"`,      { type: Sequelize.QueryTypes.SELECT })
  const [lc] = await sequelize.query(`SELECT COUNT(*) AS cnt FROM "PublicationAuthors"`,{ type: Sequelize.QueryTypes.SELECT })

  console.log('\n═══════════════════════════════════════')
  console.log('✅ SEED COMPLETE')
  console.log(`   Staff:              ${sc.cnt}`)
  console.log(`   Publications:       ${pc.cnt}`)
  console.log(`   PublicationAuthors: ${lc.cnt}`)
  console.log('═══════════════════════════════════════')

  await sequelize.close()
  process.exit(0)
}

main().catch(err => {
  console.error('\n❌ SEED FAILED:', err.message)
  console.error(err)
  process.exit(1)
})
