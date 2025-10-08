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

    let publicationTableResult = [
            {
                "description": "ผลงานวิจัยทั้งหมด",
                "amount": 230,
                "target" : 200,
                "remark" : "/",
            },
            {
                "description": "Tier 1",
                "amount": 26,
                "target" : 12,
                "remark" : "/",
            },
            {
                "description": "Q1",
                "amount": 97,
                "target" : 48,
                "remark" : "/",
            },
            {
                "description": "ร่วมกับต่างประเทศ",
                "amount": 64,
                "target" : 0,
                "remark" : "X",
            },
            {
                "description": "Citations 2025",
                "amount": 6451,
                "target" : 3200,
                "remark" : "/",
            },  
            {
                "description": "H-index",
                "amount": 7.6,
                "target" : 7.25,
                "remark" : "/",
            },                       
        ]  

    let publicationScopusResult = [
            {
                "publication": "Q1",
                "scopus": 72,
            },
            {
                "publication": "Q2",
                "scopus": 99,
            },
            {
                "publication": "Q3",
                "scopus": 22,
            },
            {
                "publication": "Q4",
                "scopus": 11,
            },
            {
                "publication": "Tier1",
                "scopus": 28,
            },            
        ]        
    let publicationISIResult = [
            {
                "publication": "Q1",
                "ISI(SCIE)": 59,
            },
            {
                "publication": "Q2",
                "ISI(SCIE)": 40,
            },
            {
                "publication": "Q3",
                "ISI(SCIE)": 22,
            },
            {
                "publication": "Q4",
                "ISI(SCIE)": 5,
            },
            {
                "publication": "ไม่อยู่ในฐาน",
                "ISI(SCIE)": 103,
            },            
            {
                "publication": "N/A",
                "ISI(SCIE)": 1,
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
      publicationTable: publicationTableResult,
      publicationScopus: publicationScopusResult,
      publicationISI: publicationISIResult,
      academicWork: academyWorkResult,
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
