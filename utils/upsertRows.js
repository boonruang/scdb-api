const { Op } = require('sequelize')
const sequelize = require('../config/db-instance')

// นำเข้าแบบกันซ้ำ: แถวที่ key ตรงกับของเดิมใน DB = update, ไม่ตรง = insert
// แถวที่ key ซ้ำกันเองในไฟล์ ใช้แถวล่างสุด (dupInFile นับไว้รายงาน)
// keyFields: ชื่อคอลัมน์ที่ใช้เป็น key; แถวที่ key ว่างครบทุกช่องจะ insert เสมอ
//
// ดึงแถวเดิมที่อาจชนมาครั้งเดียว (กรองด้วย key ตัวแรก) แทนการ update ทีละแถว
// เดิมทีละแถว 489 แถวใช้เกิน 20 วินาที ชน timeout ของ axios ฝั่งหน้าเว็บ
// แถวที่ค่าเหมือนเดิมทุกช่องไม่เขียนซ้ำ import ไฟล์เดิมรอบสองจึงแทบไม่มี write
const keyOf = (row, keyFields) =>
  JSON.stringify(keyFields.map((k) => (row[k] === undefined || row[k] === null ? '' : String(row[k]).trim())))

const same = (a, b) => {
  if (a === null || a === undefined || a === '') return b === null || b === undefined || b === ''
  if (a instanceof Date || b instanceof Date) return String(a).slice(0, 10) === String(b).slice(0, 10)
  return String(a) === String(b)
}

async function upsertRows(model, rows, keyFields) {
  const keyed = new Map()
  const unkeyed = []
  for (const row of rows) {
    const k = keyOf(row, keyFields)
    if (JSON.parse(k).every((v) => v === '')) unkeyed.push(row)
    else keyed.set(k, row)
  }
  const dupInFile = rows.length - keyed.size - unkeyed.length

  const pk = model.primaryKeyAttribute
  const firstVals = [...new Set([...keyed.values()].map((r) => r[keyFields[0]]).filter((v) => v !== undefined && v !== null))]
  const existing = firstVals.length
    ? await model.findAll({ where: { [keyFields[0]]: { [Op.in]: firstVals } }, raw: true })
    : []
  const byKey = new Map(existing.map((e) => [keyOf(e, keyFields), e]))

  const toCreate = [...unkeyed]
  const toUpdate = []
  let updated = 0
  for (const [k, row] of keyed) {
    const old = byKey.get(k)
    if (!old) { toCreate.push(row); continue }
    updated++
    const changes = {}
    Object.keys(row).forEach((f) => { if (f !== pk && !same(row[f], old[f])) changes[f] = row[f] })
    if (Object.keys(changes).length) toUpdate.push({ id: old[pk], changes })
  }

  await sequelize.transaction(async (t) => {
    for (const u of toUpdate) await model.update(u.changes, { where: { [pk]: u.id }, transaction: t })
    if (toCreate.length) await model.bulkCreate(toCreate, { transaction: t })
  })
  return { inserted: toCreate.length, updated, dupInFile, changed: toUpdate.length }
}

module.exports = { upsertRows }
