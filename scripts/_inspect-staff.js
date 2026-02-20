const XLSX = require('xlsx')
const wb = XLSX.readFile('D:/680612_science_msu/docs/ข้อมูลฝ่ายบุคลากรและวิเทศสัมพันธ์.xlsx')
const ws = wb.Sheets['ข้อมูลบุคคลากร']
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
const data = rows.slice(2).filter(r => r[0] !== '' && r[1] !== '')
console.log('Total:', data.length)
// แสดงทุก col พร้อม type สำหรับ 10 แถว
data.slice(0, 10).forEach((r, i) => {
  console.log(`\nRow${i+1}:`)
  r.forEach((v, ci) => { if (v !== '') console.log(`  col${ci}:`, JSON.stringify(v), typeof v) })
})
