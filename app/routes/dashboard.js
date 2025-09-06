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

    let publicationScopusResult = [
            {
                "province": "Q1",
                "scopus": 72,
            },
            {
                "province": "Q2",
                "scopus": 99,
            },
            {
                "province": "Q3",
                "scopus": 22,
            },
            {
                "province": "Q4",
                "scopus": 11,
            },
            {
                "province": "Tier1",
                "scopus": 28,
            },            
        ]

    let publicationISIResult = [
            {
                "province": "Q1",
                "dummy1" : 0,
                "ISI(SCIE)": 59,
            },
            {
                "province": "Q2",
                "dummy1" : 0,
                "ISI(SCIE)": 40,
            },
            {
                "province": "Q3",
                "dummy1" : 0,
                "ISI(SCIE)": 22,
            },
            {
                "province": "Q4",
                "dummy1" : 0,
                "ISI(SCIE)": 5,
            },
            {
                "province": "ไม่อยู่ในฐาน",
                "dummy1" : 0,
                "ISI(SCIE)": 103,
            },            
            {
                "province": "N/A",
                "dummy1" : 0,
                "ISI(SCIE)": 1,
            },            
        ]        

  let academyWorkResult = [
            {
                "province": "Biology",
                "academic": 40,
                "international": 30,
                "student": 35,
                "staff": 20,
                "teacher": 35,
            },
            {
                "province": "Chemistry",
                "academic": 78,
                "domestic": 10,
                "international": 27,
                "student": 78,
                "staff": 30,
                "teacher": 25,
            },
            {
                "province": "Physics",
                "academic": 56,
                "domestic": 7,
                "international": 25,
                "student": 10,
                "staff": 21,
                "teacher": 32,
            },
            {
                "province": "Mathematics",
                "academic": 35,
                "domestic": 5,
                "international": 18,
                "student": 15,
                "staff": 30,
                "teacher": 42,
            }
        ]

  try {
    let dashboard = {
      publicationScopus: publicationScopusResult,
      publicationISI: publicationISIResult,
      academicWork: academyWorkResult,
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
