const XLSX = require('xlsx')
const path = require('path')

const wb = XLSX.readFile(path.join(__dirname, '../../docs/ข้อมูลฝ่ายบุคลากรและวิเทศสัมพันธ์.xlsx'))
const ws = wb.Sheets['ข้อมูลบุคคลากร']
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
const data = rows.slice(2).filter(r => r[0] !== '' && r[1] !== '')

const counts = {}
data.forEach(r => {
  const v = String(r[11]).trim() || '(ว่าง)'
  counts[v] = (counts[v] || 0) + 1
})
console.log('col11 (สังกัด) unique values:')
Object.entries(counts).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
  console.log(' ', JSON.stringify(k), '=', v, 'คน')
})
