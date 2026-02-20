const XLSX = require('xlsx')

const wbHR = XLSX.readFile('D:/680612_science_msu/docs/ข้อมูลฝ่ายบุคลากรและวิเทศสัมพันธ์.xlsx')
const wsHR = wbHR.Sheets['ข้อมูลบุคคลากร']
const rowsHR = XLSX.utils.sheet_to_json(wsHR, { header: 1, defval: '' })
const hrData = rowsHR.slice(2).filter(r => r[0] !== '' && r[1] !== '')

// HR: ชื่อ+นามสกุล ไทย
const hrThMap = {}
hrData.forEach((r, idx) => {
  const fn = String(r[3]).trim()
  const ln = String(r[4]).trim()
  if (fn || ln) hrThMap[`${fn}|${ln}`] = idx
})
console.log('HR TH keys (first 5):', Object.keys(hrThMap).slice(0, 5))

// Research: col2 = ID(A), col3 = ชื่อไทย (รูป "ชื่อ นามสกุล" หรือ "นามสกุล ชื่อ"?)
const wbR = XLSX.readFile('D:/680612_science_msu/docs/ข้อมูลฝ่ายวิจัย_Auther_profile_support.xlsx')
const wsR = wbR.Sheets['Author profile']
const rowsR = XLSX.utils.sheet_to_json(wsR, { header: 1, defval: '' })
const rData = rowsR.slice(1).filter(r => r[0] !== '')

console.log('\nResearch col2 (ชื่อไทย), col3 (First), col4 (Last):')
rData.slice(0, 8).forEach(r => {
  console.log(' ', JSON.stringify([r[0], r[2], r[3], r[4]]))
})

// ลอง match ชื่อไทยจาก col3+col4 (First ENG + Last ENG) กับ HR col3+col4 (ชื่อไทย)
// จริงๆ Excel วิจัย col2 = "รายชื่ออาจารย์" (ชื่อไทย full)
// ลองแยก ชื่อ|นามสกุล
let matched = 0
rData.forEach(r => {
  const fullName = String(r[2]).trim() // รายชื่ออาจารย์
  const parts = fullName.split(' ').filter(Boolean)
  if (parts.length >= 2) {
    const fn = parts[0]
    const ln = parts[1]
    const key = `${fn}|${ln}`
    if (hrThMap[key] !== undefined) matched++
  }
})
console.log('\nMatch by col2 split:', matched, '/', rData.length)
