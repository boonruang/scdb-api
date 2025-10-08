const express = require('express')
const department = require('../../models/sciences/department')
const student = require('../../models/sciences/student')
const academicProgram = require('../../models/sciences/academicProgram')
const router = express.Router()

//  @route                  GET  /api/v2/dashboard/list
//  @desc                   list all dashboard
//  @access                 Private
router.get('/list', async (req, res) => {
  console.log('get dashboard list API called')
  const amountDept = await department.count({ where: { dept_type: "ภาควิชา" }});
  const amountBachelor = await academicProgram.count({ where: { degree_level: "ปริญญาตรี" }});
  const amountMaster = await academicProgram.count({ where: { degree_level: "ปริญญาโท" }});
  const amountPhd = await academicProgram.count({ where: { degree_level: "ปริญญาเอก" }});


  const amountStudentStat = await student.count({ where: { program_id: 2 }});
  const amountStudentMath = await student.count({ where: { program_id: 1 }});
  const amountStudentChem = await student.count({ where: { program_id: 12 }});
  const amountStudentBioChemInno = await student.count({ where: { program_id: 13 }});

  const amountStudentBio = await student.count({ where: { program_id: 17 }});
  const amountStudentMicro = await student.count({ where: { program_id: 10 }});
  const amountStudentGen = await student.count({ where: { program_id: 11 }});
  const amountStudentPhysic = await student.count({ where: { program_id: 3 }});

  const amountStudentApplyPhysic = await student.count({ where: { program_id: 4 }});
  const amountStudentApplyEnergy = await student.count({ where: { program_id: 5 }});
  const amountStudentApplyElec = await student.count({ where: { program_id: 6 }});
  const amountStudentEnergy = await student.count({ where: { program_id: 7 }});

  const amountStudentPhysicEdu = await student.count({ where: { program_id: 8 }});
  const amountStudentPhysic21 = await student.count({ where: { program_id: 28 }});
  const amountStudentPhysic22 = await student.count({ where: { program_id: 29 }});

  const amountStudentTotal = amountStudentStat + amountStudentMath + amountStudentChem + amountStudentBioChemInno
  + amountStudentBio + amountStudentMicro + amountStudentGen + amountStudentPhysic
  + amountStudentApplyPhysic + amountStudentApplyEnergy + amountStudentApplyElec + amountStudentEnergy
  + amountStudentPhysicEdu + amountStudentPhysic21 +  amountStudentPhysic22

  const studentStatPercent = amountStudentStat / amountStudentTotal
  const studentMathPercent = amountStudentMath / amountStudentTotal
  const studentChemPercent = amountStudentChem / amountStudentTotal
  const studentBioChemInnoPercent = amountStudentBioChemInno / amountStudentTotal
  const studentBioPercent = amountStudentBio / amountStudentTotal
  const studentMicroPercent = amountStudentMicro / amountStudentTotal
  const studentGenPercent = amountStudentGen / amountStudentTotal
  const studentPhysicPercent = amountStudentPhysic / amountStudentTotal
  const studentApplyPhysicPercent = amountStudentApplyPhysic / amountStudentTotal
  const studentApplyEnergyPercent = amountStudentApplyEnergy / amountStudentTotal
  const studentApplyElecPercent = amountStudentApplyEnergy / amountStudentTotal
  const studentEnergyPercent = amountStudentEnergy / amountStudentTotal
  const studentPhysicEduPercent = amountStudentPhysicEdu / amountStudentTotal
  const studentPhysic21Percent = amountStudentPhysic21 / amountStudentTotal
  const studentPhysic22Percent = amountStudentPhysic22 / amountStudentTotal
  const studentTotalPercent = amountStudentTotal / amountStudentTotal

  try {
    let dashboard = {

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
 
      studentApply: amountStudentApplyPhysic.toLocaleString('th-TH'),
      studentApplyPercent:  studentApplyPhysicPercent.toLocaleString('th-TH'),     
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
