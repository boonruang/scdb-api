const express = require('express')
const router = express.Router()
const Staff = require('../../models/sciences/staff')
const LeaveRecord = require('../../models/sciences/leaveRecord')
const Division = require('../../models/sciences/division')
const { Op } = require('sequelize')

// GET /api/v2/dashboard/list
router.get('/list', async (req, res) => {
  try {
    const fiscalYear = parseInt(req.query.fiscalYear) || null

    // KPI — แสดงบุคลากรทั้งหมดไม่ filter ปี
    var totalTeacher = await Staff.count({ where: { stafftype_id: 1 } })
    var totalSupport = await Staff.count({ where: { stafftype_id: 2 } })
    var total = totalTeacher + totalSupport

    // LeaveRecord filter ตามปีงบประมาณ
    var leaveWhere = {}
    if (fiscalYear) {
      var startCE = fiscalYear - 543 - 1
      var endCE   = fiscalYear - 543
      leaveWhere.start_date = {
        [Op.gte]: new Date(startCE + '-10-01'),
        [Op.lte]: new Date(endCE   + '-09-30'),
      }
    }

    // ดึง Staff ทั้งหมด + LeaveRecord filter ตามปี
    var allStaff = await Staff.findAll({
      attributes: ['staff_id', 'position_no', 'stafftype_id', 'title_th', 'firstname_th', 'lastname_th', 'position', 'education', 'startdate', 'division_id'],
      include: [
        { model: LeaveRecord, attributes: ['leave_id', 'leave_type', 'start_date', 'end_date'], where: Object.keys(leaveWhere).length ? leaveWhere : undefined, required: false },
        { model: Division, attributes: ['division_id', 'division_name'], required: false },
      ],
      order: [['stafftype_id', 'ASC'], ['firstname_th', 'ASC']],
    })

    // staffList พร้อม division name
    var staffList = allStaff.map(function(s) {
      return {
        staff_id: s.staff_id,
        position_no: s.position_no || '',
        status: s.stafftype_id === 1 ? 'อาจารย์' : 'สายสนับสนุน',
        fullname_th: (s.title_th || '') + (s.firstname_th || '') + ' ' + (s.lastname_th || ''),
        position: s.position || '',
        education: s.education || '',
        dept: (s.Division || {}).division_name || '',
        leaveList: (s.LeaveRecords || []).map(function(l) {
          return {
            leave_type: l.leave_type || '',
            start_date: l.start_date || null,
            end_date: l.end_date || null,
          }
        }),
      }
    })

    // staffByDept — group โดย dept name
    var deptGroupMap = {}
    staffList.forEach(function(s) {
      var d = s.dept || 'ไม่ระบุ'
      if (!deptGroupMap[d]) deptGroupMap[d] = { dept: d, teacher: 0, support: 0, total: 0 }
      if (s.status === 'อาจารย์') deptGroupMap[d].teacher++
      else deptGroupMap[d].support++
      deptGroupMap[d].total++
    })
    var staffByDept = Object.values(deptGroupMap)

    // leaveStats — group by leave_type
    var leaveTypeMap = {}
    staffList.forEach(function(s) {
      s.leaveList.forEach(function(l) {
        var t = l.leave_type || 'ไม่ระบุ'
        leaveTypeMap[t] = (leaveTypeMap[t] || 0) + 1
      })
    })
    var leaveStats = Object.keys(leaveTypeMap).map(function(t) {
      return { type: t, count: leaveTypeMap[t] }
    })
    var leaveByType = leaveStats.map(function(l) {
      return { id: l.type, label: l.type, value: l.count }
    })

    res.json({
      status: 'ok',
      result: {
        kpi: { total: total, teacher: totalTeacher, support: totalSupport },
        staffByDept: staffByDept,
        staffList: staffList,
        leaveStats: leaveStats,
        leaveByType: leaveByType,
      }
    })
  } catch (e) {
    res.json({ status: 'nok', result: e.message })
  }
})

module.exports = router
