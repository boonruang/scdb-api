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
  console.log('get dashboard1 list API called')
  const amountStaff = await staff.count()


    let academicPositionResult = [
            {
                "position": "ผศ.ดร.",
                "amount": 64,
            },
            {
                "position": "รศ.ดร.",
                "amount": 57,
            },
            {
                "position": "อ.ดร.",
                "amount": 23,
            },
            {
                "position": "อ.",
                "amount": 11,
            },
            {
                "position": "ศ.ดร.",
                "amount": 28,
            },            
        ]        


  let academyWorkResult = [
            {
                "catalog": "Biology",
                "academic": 40,
                "international": 30,
                "student": 35,
                "staff": 20,
                "teacher": 35,
            },
            {
                "catalog": "Chemistry",
                "academic": 78,
                "domestic": 10,
                "international": 27,
                "student": 78,
                "staff": 30,
                "teacher": 25,
            },
            {
                "catalog": "Physics",
                "academic": 56,
                "domestic": 7,
                "international": 25,
                "student": 10,
                "staff": 21,
                "teacher": 32,
            },
            {
                "catalog": "Mathematics",
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
      academicWork: academyWorkResult,
      academicPosition: academicPositionResult,

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
