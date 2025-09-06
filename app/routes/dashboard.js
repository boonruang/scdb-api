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

  const amountDept = 4
  const amountBachelor = 13
  const amountMaster = 8
  const amountPhd = 6

  const amountStudentStat = 69
  const amountStudentMath = 354
  const amountStudentChem = 500
  const amountStudentBioChemInno = 143

  const amountStudentBio = 551
  const amountStudentMicro = 258
  const amountStudentGen = 86
  const amountStudentPhysic = 86

  const amountStudentApply = 42
  const amountStudentApplyEnergy = 2
  const amountStudentApplyElec = 1
  const amountStudentEnergy = 62

  const amountStudentPhysicEdu = 178
  const amountStudentPhysic21 = 13
  const amountStudentPhysic22 = 14
  const amountStudentTotal = 2359

  const total = amountStudent + amountStaff  + amountUser + amountLog
  const studentPercent = amountStudent / total
  const staffPercent = amountStaff / total
  const userPercent = amountStaff / total
  const logPercent = amountLog / total


  const studentStatPercent = amountStudentStat / amountStudentTotal
  const studentMathPercent = amountStudentMath / amountStudentTotal
  const studentChemPercent = amountStudentChem / amountStudentTotal
  const studentBioChemInnoPercent = amountStudentBioChemInno / amountStudentTotal
  const studentBioPercent = amountStudentBio / amountStudentTotal
  const studentMicroPercent = amountStudentMicro / amountStudentTotal
  const studentGenPercent = amountStudentGen / amountStudentTotal
  const studentPhysicPercent = amountStudentPhysic / amountStudentTotal
  const studentApplyPercent = amountStudentApply / amountStudentTotal
  const studentApplyEnergyPercent = amountStudentApplyEnergy / amountStudentTotal
  const studentApplyElecPercent = amountStudentApplyEnergy / amountStudentTotal
  const studentEnergyPercent = amountStudentEnergy / amountStudentTotal
  const studentPhysicEduPercent = amountStudentPhysicEdu / amountStudentTotal
  const studentPhysic21Percent = amountStudentPhysic21 / amountStudentTotal
  const studentPhysic22Percent = amountStudentPhysic22 / amountStudentTotal
  const studentTotalPercent = amountStudentTotal / amountStudentTotal

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

      amountDept : amountDept,
      amountBachelor : amountBachelor,
      amountMaster : amountMaster,
      amountPhd : amountPhd,

      studentStat: amountStudentStat.toLocaleString('th-TH'),
      studentStatPercent:  studentStatPercent.toLocaleString('th-TH'),    
      studentMath: amountStudentMath.toLocaleString('th-TH'),
      studentMathPercent:  studentMathPercent.toLocaleString('th-TH'),     
      studentChem: amountStudentChem.toLocaleString('th-TH'),
      studentChemPercent:  studentChemPercent.toLocaleString('th-TH'),     
      studentBioChemInno: amountStudentBioChemInno.toLocaleString('th-TH'),
      studentBioChemInnoPercent:  studentBioChemInnoPercent.toLocaleString('th-TH'),   

      studentBio: amountStudentBio.toLocaleString('th-TH'),
      studentBioPercent:  studentBioPercent.toLocaleString('th-TH'),     
      studentMicro: amountStudentMicro.toLocaleString('th-TH'),
      studentMicroPercent:  studentMicroPercent.toLocaleString('th-TH'),    
      studentGen: amountStudentGen.toLocaleString('th-TH'),
      studentGenPercent:  studentGenPercent.toLocaleString('th-TH'),      
      studentPhysic: amountStudentPhysic.toLocaleString('th-TH'),
      studentPhysicPercent:  studentPhysicPercent.toLocaleString('th-TH'),      
 
      studentApply: amountStudentApply.toLocaleString('th-TH'),
      studentApplyPercent:  studentApplyPercent.toLocaleString('th-TH'),     
      studentApplyEnergy: amountStudentApplyEnergy.toLocaleString('th-TH'),
      studentApplyEnergyPercent:  studentApplyEnergyPercent.toLocaleString('th-TH'),    
      studentApplyElec: amountStudentApplyElec.toLocaleString('th-TH'),
      studentApplyElecPercent:  studentApplyElecPercent.toLocaleString('th-TH'),      
      studentEnergy: amountStudentEnergy.toLocaleString('th-TH'),
      studentEnergyPercent:  studentEnergyPercent.toLocaleString('th-TH'),  
      

      studentPhysicEdu: amountStudentPhysicEdu.toLocaleString('th-TH'),
      studentPhysicEduPercent:  studentPhysicEduPercent.toLocaleString('th-TH'),     
      studentPhysic21: amountStudentPhysic21.toLocaleString('th-TH'),
      studentPhysic21Percent:  studentPhysic21Percent.toLocaleString('th-TH'),    
      studentPhysic22: amountStudentPhysic22.toLocaleString('th-TH'),
      studentPhysic22Percent:  studentPhysic22Percent.toLocaleString('th-TH'),      
      studentTotal: amountStudentTotal.toLocaleString('th-TH'),
      studentTotalPercent:  studentTotalPercent.toLocaleString('th-TH'),        
      
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
