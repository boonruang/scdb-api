const express = require('express')
const student = require('../../models/sciences/student')
const staff = require('../../models/sciences/staff')
const user = require('../../models/user')
const log = require('../../models/log')
const router = express.Router()

//  @route                  GET  /api/v2/dashboard/list
//  @desc                   list all dashboard
//  @access                 Private
router.get('/list', async (req, res) => {
  console.log('get dashboard list API called')
  const amountStudent = await student.count()
  const amountStaff = await staff.count()
  const amountUser = await user.count()
  const amountLog = await log.count()
  const total = amountStudent + amountStaff  + amountUser + amountLog
  const studentPercent = amountStudent / total
  const staffPercent = amountStaff / total
  const userPercent = amountStaff / total
  const logPercent = amountLog/ total

  try {
    let dashboard = {
      student: amountStudent.toLocaleString('th-TH'),
      studentPercent:  studentPercent.toLocaleString('th-TH'),
      staff:  amountStaff.toLocaleString('th-TH'),
      staffPercent:  staffPercent.toLocaleString('th-TH'),
      user : amountUser.toLocaleString('th-TH'),
      userPercent:  userPercent.toLocaleString('th-TH'),
      log : amountLog.toLocaleString('th-TH'),
      logPercent : logPercent.toLocaleString('th-TH'),
    }

    if (dashboard) {
      res.status(200).json({
        status: 'ok',
        result: dashboard,
      })
    } else {
      res.status(500).json({
        status: 'nok',
      })
    }

  } catch (error) {
    res.status(500).json({
      Error: error.toString(),
    })
  }
})


module.exports = router
