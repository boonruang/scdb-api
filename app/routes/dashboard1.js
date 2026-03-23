const express = require('express')
const router = express.Router()
const Staff = require('../../models/sciences/staff')
const LeaveRecord = require('../../models/sciences/leaveRecord')
const { Op } = require('sequelize')

// GET /api/v2/dashboard/list
router.get('/list', async (req, res) => {
  try {
    // KPI
    var totalTeacher = await Staff.count({ where: { stafftype_id: 1 } })
    var totalSupport = await Staff.count({ where: { stafftype_id: 2 } })
    var total = totalTeacher + totalSupport

    // บุคลากรแยกตามสังกัด (department_name field ใน Staff)
    var allStaff = await Staff.findAll({
      attributes: ['staff_id', 'position_no', 'stafftype_id', 'title_th', 'firstname_th', 'lastname_th', 'position', 'education', 'startdate', 'department_id'],
      include: [{ model: LeaveRecord, attributes: ['leave_id', 'leave_type', 'start_date', 'end_date'] }],
      order: [['stafftype_id', 'ASC'], ['firstname_th', 'ASC']],
    })

    // ดึง dept name จาก Department (staff มี department_id FK)
    var Department = require('../../models/sciences/department')
    var depts = await Department.findAll({ attributes: ['department_id', 'department_name', 'dept_name'] })
    var deptMap = {}
    depts.forEach(function(d) { deptMap[d.department_id] = d.department_name || d.dept_name || '' })

    // staffList พร้อม dept name
    var staffList = allStaff.map(function(s) {
      return {
        staff_id: s.staff_id,
        position_no: s.position_no || '',
        status: s.stafftype_id === 1 ? 'อาจารย์' : 'สายสนับสนุน',
        fullname_th: (s.title_th || '') + (s.firstname_th || '') + ' ' + (s.lastname_th || ''),
        position: s.position || '',
        education: s.education || '',
        dept: deptMap[s.department_id] || '',
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
