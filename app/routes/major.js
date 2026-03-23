const express = require('express')
const router = express.Router()
const Major = require('../../models/sciences/major')
const Department = require('../../models/sciences/department')
const { Op } = require('sequelize')

// GET /api/v2/major/list — list all majors with department
router.get('/list', async (req, res) => {
  try {
    var rows = await Major.findAll({ include: [{ model: Department, attributes: ['department_id', 'department_name', 'department_code'] }], order: [['major_name', 'ASC']] })
    res.json({ status: 'ok', result: rows })
  } catch (e) { res.json({ status: 'nok', result: e.message }) }
})

// GET /api/v2/major/:id
router.get('/:id', async (req, res) => {
  try {
    var row = await Major.findByPk(req.params.id, { include: [Department] })
    res.json({ status: 'ok', result: row })
  } catch (e) { res.json({ status: 'nok', result: e.message }) }
})

// POST /api/v2/major — create
router.post('/', async (req, res) => {
  try {
    var row = await Major.create({ major_name: req.body.major_name, department_id: req.body.department_id || null })
    res.json({ status: 'ok', result: row })
  } catch (e) { res.json({ status: 'nok', result: e.message }) }
})

// PUT /api/v2/major/:id
router.put('/:id', async (req, res) => {
  try {
    await Major.update({ major_name: req.body.major_name, department_id: req.body.department_id || null }, { where: { major_id: req.params.id } })
    res.json({ status: 'ok' })
  } catch (e) { res.json({ status: 'nok', result: e.message }) }
})

// DELETE /api/v2/major/:id
router.delete('/:id', async (req, res) => {
  try {
    await Major.destroy({ where: { major_id: req.params.id } })
    res.json({ status: 'ok' })
  } catch (e) { res.json({ status: 'nok', result: e.message }) }
})

// POST /api/v2/major/preview-mapping
// รับ array ของ { department_name, major_name } จาก Excel
// ส่งกลับ mapping + สถานะว่าสร้างใหม่หรือมีอยู่แล้ว
router.post('/preview-mapping', async (req, res) => {
  try {
    var pairs = req.body.pairs || [] // [{ department_name, major_name }]

    // extract unique departments + majors
    var deptNames = [...new Set(pairs.map(function(p) { return (p.department_name || '').trim() }).filter(Boolean))]
    var majorPairs = []
    pairs.forEach(function(p) {
      var dn = (p.department_name || '').trim()
      var mn = (p.major_name || '').trim()
      if (mn && !majorPairs.find(function(x) { return x.department_name === dn && x.major_name === mn })) {
        majorPairs.push({ department_name: dn, major_name: mn })
      }
    })

    // เช็ค departments ที่มีอยู่แล้ว (เช็คทั้ง department_name และ dept_name)
    var existingDepts = await Department.findAll({
      where: { [Op.or]: [{ department_name: { [Op.in]: deptNames } }, { dept_name: { [Op.in]: deptNames } }] }
    })
    var existingDeptMap = {}
    existingDepts.forEach(function(d) {
      if (d.department_name) existingDeptMap[d.department_name] = d
      if (d.dept_name) existingDeptMap[d.dept_name] = d
    })

    // สร้าง department summary
    var departmentSummary = deptNames.map(function(name) {
      var existing = existingDeptMap[name]
      var codeMap = {
        'คณิตศาสตร์': 'MATH', 'เคมี': 'CHEM', 'ฟิสิกส์': 'PHYS', 'ชีววิทยา': 'BIO',
        'จุลชีววิทยา': 'MICRO', 'ชีวเคมี': 'BIOC', 'สถิติ': 'STAT', 'คอมพิวเตอร์': 'CS',
        'วิทยาการคอมพิวเตอร์': 'CS', 'เทคโนโลยีสารสนเทศ': 'IT', 'สิ่งแวดล้อม': 'ENV',
      }
      var autoCode = 'DEPT'
      for (var k in codeMap) { if (name.indexOf(k) !== -1) { autoCode = codeMap[k]; break } }
      return {
        department_name: name,
        department_code: existing ? existing.department_code : autoCode,
        status: existing ? 'exists' : 'new',
        department_id: existing ? existing.department_id : null,
      }
    })

    // เช็ค majors ที่มีอยู่แล้ว
    var majorNames = majorPairs.map(function(p) { return p.major_name })
    var existingMajors = await Major.findAll({ where: { major_name: { [Op.in]: majorNames } } })
    var existingMajorMap = {}
    existingMajors.forEach(function(m) { existingMajorMap[m.major_name] = m })

    var majorSummary = majorPairs.map(function(p) {
      var existing = existingMajorMap[p.major_name]
      return {
        major_name: p.major_name,
        department_name: p.department_name,
        status: existing ? 'exists' : 'new',
        major_id: existing ? existing.major_id : null,
      }
    })

    res.json({ status: 'ok', result: { departments: departmentSummary, majors: majorSummary } })
  } catch (e) { res.json({ status: 'nok', result: e.message }) }
})

// POST /api/v2/major/confirm-mapping
// รับ confirmed departments + majors แล้ว upsert เข้า DB
// ส่งกลับ map ของ department_name -> department_id และ major_name -> major_id
router.post('/confirm-mapping', async (req, res) => {
  try {
    var departments = req.body.departments || [] // [{ department_name, department_code, department_id (ถ้ามีอยู่แล้ว) }]
    var majors = req.body.majors || []           // [{ major_name, department_name }]

    // upsert departments
    var deptIdMap = {} // department_name -> department_id
    for (var i = 0; i < departments.length; i++) {
      var d = departments[i]
      if (d.department_id) {
        // มีอยู่แล้ว อัพเดท code ถ้าเปลี่ยน
        await Department.update({ department_code: d.department_code }, { where: { department_id: d.department_id } })
        deptIdMap[d.department_name] = d.department_id
      } else {
        // สร้างใหม่
        var created = await Department.create({ department_name: d.department_name, department_code: d.department_code, dept_name: d.department_name, dept_type: 'ภาควิชา' })
        deptIdMap[d.department_name] = created.department_id
      }
    }

    // upsert majors
    var majorIdMap = {} // major_name -> major_id
    for (var j = 0; j < majors.length; j++) {
      var m = majors[j]
      var deptId = deptIdMap[m.department_name] || null
      if (m.major_id) {
        await Major.update({ department_id: deptId }, { where: { major_id: m.major_id } })
        majorIdMap[m.major_name] = m.major_id
      } else {
        var [createdMajor] = await Major.findOrCreate({ where: { major_name: m.major_name }, defaults: { department_id: deptId } })
        if (deptId && !createdMajor.department_id) await createdMajor.update({ department_id: deptId })
        majorIdMap[m.major_name] = createdMajor.major_id
      }
    }

    res.json({ status: 'ok', result: { deptIdMap: deptIdMap, majorIdMap: majorIdMap } })
  } catch (e) { res.json({ status: 'nok', result: e.message }) }
})

module.exports = router
