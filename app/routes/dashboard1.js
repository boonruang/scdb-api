const express = require('express')
const student = require('../../models/sciences/student')
const staff = require('../../models/sciences/staff')
const department = require('../../models/sciences/department')
const academicProgram = require('../../models/sciences/academicProgram')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const router = express.Router()

//  @route                  GET  /api/v2/dashboard/list
//  @desc                   list all dashboard
//  @access                 Private
router.get('/list', async (req, res) => {
  console.log('get dashboard1 list API called')

  const amountDept = await department.count({ where: { dept_type: "ภาควิชา" }});
  const amountBachelor = await academicProgram.count({ where: { degree_level: "ปริญญาตรี" }});
  const amountMaster = await academicProgram.count({ where: { degree_level: "ปริญญาโท" }});
  const amountPhd = await academicProgram.count({ where: { degree_level: "ปริญญาเอก" }});

    const staff_p_lv1 = await staff.count({
        where: {
          [Op.and]: [
            {  position: { [Op.eq] : "ศาสตราจารย์" }}, 
            {  stafftype_id: { [Op.eq] : 1 }}       
          ]
        } 
    });

    const staff_p_lv2 = await staff.count({
        where: {
          [Op.and]: [
            {  position: { [Op.eq] : "รองศาสตราจารย์" }}, 
            {  stafftype_id: { [Op.eq] : 1 }}       
          ]
        } 
    });

    const staff_p_lv3 = await staff.count({
        where: {
          [Op.and]: [
            {  position: { [Op.eq] : "ผู้ช่วยศาสตราจารย์" }}, 
            {  stafftype_id: { [Op.eq] : 1 }}       
          ]
        } 
    });

    const staff_p_lv4 = await staff.count({
        where: {
          [Op.and]: [
            {  position: { [Op.eq] : "อาจารย์ศาสตราจารย์" }}, 
            {  stafftype_id: { [Op.eq] : 1 }}       
          ]
        } 
    });

    const staff_p_lv5 = await staff.count({
        where: {
          [Op.and]: [
            {  position: { [Op.eq] : "อาจารย์" }}, 
            {  stafftype_id: { [Op.eq] : 1 }}       
          ]
        } 
    });


    let academicPositionResult = [
            {
                "position": "ผศ.ดร.",
                "amount": `${staff_p_lv3}`,
            },
            {
                "position": "รศ.ดร.",
                "amount": `${staff_p_lv2}`,
            },
            {
                "position": "อ.ดร.",
                "amount": `${staff_p_lv4}`,
            },
            {
                "position": "อ.",
                "amount": `${staff_p_lv5}`,
            },
            {
                "position": "ศ.ดร.",
                "amount": `${staff_p_lv1}`,
            },            
        ]        


// ตำแหน่งทางวิชาการภาควิชาคณิตศาสตร์
    const staff_mathematics_prof1 = await staff.count({
        where: {
          [Op.and]: [
            {  position: { [Op.eq] : "ศาสตราจารย์" }}, 
            {  stafftype_id: { [Op.eq] : 1 }},       
            {  department_id: { [Op.eq] : 1 }}       
          ]
        } 
    });

    const staff_mathematics_prof2 = await staff.count({
        where: {
          [Op.and]: [
            {  position: { [Op.eq] : "รองศาสตราจารย์" }}, 
            {  stafftype_id: { [Op.eq] : 1 }},       
            {  department_id: { [Op.eq] : 1 }}       
          ]
        } 
    });   
    
    const staff_mathematics_prof3 = await staff.count({
        where: {
          [Op.and]: [
            {  position: { [Op.eq] : "ผู้ช่วยศาสตราจารย์" }}, 
            {  stafftype_id: { [Op.eq] : 1 }},       
            {  department_id: { [Op.eq] : 1 }}       
          ]
        } 
    });    
    
    
    const staff_mathematics_prof4 = await staff.count({
        where: {
          [Op.and]: [
            {  position: { [Op.eq] : "อาจารย์ศาสตราจารย์" }}, 
            {  stafftype_id: { [Op.eq] : 1 }},       
            {  department_id: { [Op.eq] : 1 }}       
          ]
        } 
    });     


    const staff_mathematics_prof5 = await staff.count({
        where: {
          [Op.and]: [
            {  position: { [Op.eq] : "อาจารย์" }}, 
            {  stafftype_id: { [Op.eq] : 1 }},       
            {  department_id: { [Op.eq] : 1 }}       
          ]
        } 
    });      

// ตำแหน่งทางวิชาการภาควิชาฟิสิกส์
    const staff_physics_prof1 = await staff.count({
        where: {
          [Op.and]: [
            {  position: { [Op.eq] : "ศาสตราจารย์" }}, 
            {  stafftype_id: { [Op.eq] : 1 }},       
            {  department_id: { [Op.eq] : 2 }}       
          ]
        } 
    });

    const staff_physics_prof2 = await staff.count({
        where: {
          [Op.and]: [
            {  position: { [Op.eq] : "รองศาสตราจารย์" }}, 
            {  stafftype_id: { [Op.eq] : 1 }},       
            {  department_id: { [Op.eq] : 2 }}       
          ]
        } 
    });   
    
    const staff_physics_prof3 = await staff.count({
        where: {
          [Op.and]: [
            {  position: { [Op.eq] : "ผู้ช่วยศาสตราจารย์" }}, 
            {  stafftype_id: { [Op.eq] : 1 }},       
            {  department_id: { [Op.eq] : 2 }}       
          ]
        } 
    });    
    
    
    const staff_physics_prof4 = await staff.count({
        where: {
          [Op.and]: [
            {  position: { [Op.eq] : "อาจารย์ศาสตราจารย์" }}, 
            {  stafftype_id: { [Op.eq] : 1 }},       
            {  department_id: { [Op.eq] : 2 }}       
          ]
        } 
    });     


    const staff_physics_prof5 = await staff.count({
        where: {
          [Op.and]: [
            {  position: { [Op.eq] : "อาจารย์" }}, 
            {  stafftype_id: { [Op.eq] : 1 }},       
            {  department_id: { [Op.eq] : 2 }}       
          ]
        } 
    });      

// ตำแหน่งทางวิชาการภาควิชาชีววิทยา
    const staff_biology_prof1 = await staff.count({
        where: {
          [Op.and]: [
            {  position: { [Op.eq] : "ศาสตราจารย์" }}, 
            {  stafftype_id: { [Op.eq] : 1 }},       
            {  department_id: { [Op.eq] : 3 }}       
          ]
        } 
    });

    const staff_biology_prof2 = await staff.count({
        where: {
          [Op.and]: [
            {  position: { [Op.eq] : "รองศาสตราจารย์" }}, 
            {  stafftype_id: { [Op.eq] : 1 }},       
            {  department_id: { [Op.eq] : 3 }}       
          ]
        } 
    });   
    
    const staff_biology_prof3 = await staff.count({
        where: {
          [Op.and]: [
            {  position: { [Op.eq] : "ผู้ช่วยศาสตราจารย์" }}, 
            {  stafftype_id: { [Op.eq] : 1 }},       
            {  department_id: { [Op.eq] : 3 }}       
          ]
        } 
    });    
    
    
    const staff_biology_prof4 = await staff.count({
        where: {
          [Op.and]: [
            {  position: { [Op.eq] : "อาจารย์ศาสตราจารย์" }}, 
            {  stafftype_id: { [Op.eq] : 1 }},       
            {  department_id: { [Op.eq] : 3 }}       
          ]
        } 
    });     


    const staff_biology_prof5 = await staff.count({
        where: {
          [Op.and]: [
            {  position: { [Op.eq] : "อาจารย์" }}, 
            {  stafftype_id: { [Op.eq] : 1 }},       
            {  department_id: { [Op.eq] : 3 }}       
          ]
        } 
    });      

// ตำแหน่งทางวิชาการภาควิชาเคมี
    const staff_chemistry_prof1 = await staff.count({
        where: {
          [Op.and]: [
            {  position: { [Op.eq] : "ศาสตราจารย์" }}, 
            {  stafftype_id: { [Op.eq] : 1 }},       
            {  department_id: { [Op.eq] : 3 }}       
          ]
        } 
    });

    const staff_chemistry_prof2 = await staff.count({
        where: {
          [Op.and]: [
            {  position: { [Op.eq] : "รองศาสตราจารย์" }}, 
            {  stafftype_id: { [Op.eq] : 1 }},       
            {  department_id: { [Op.eq] : 3 }}       
          ]
        } 
    });   
    
    const staff_chemistry_prof3 = await staff.count({
        where: {
          [Op.and]: [
            {  position: { [Op.eq] : "ผู้ช่วยศาสตราจารย์" }}, 
            {  stafftype_id: { [Op.eq] : 1 }},       
            {  department_id: { [Op.eq] : 3 }}       
          ]
        } 
    });    
    
    
    const staff_chemistry_prof4 = await staff.count({
        where: {
          [Op.and]: [
            {  position: { [Op.eq] : "อาจารย์ศาสตราจารย์" }}, 
            {  stafftype_id: { [Op.eq] : 1 }},       
            {  department_id: { [Op.eq] : 3 }}       
          ]
        } 
    });     


    const staff_chemistry_prof5 = await staff.count({
        where: {
          [Op.and]: [
            {  position: { [Op.eq] : "อาจารย์" }}, 
            {  stafftype_id: { [Op.eq] : 1 }},       
            {  department_id: { [Op.eq] : 3 }}       
          ]
        } 
    }); 

    let academicPositionPerDept = [
            {
                "department" : "Mathermatics",
                "ผศ.ดร.": staff_mathematics_prof3,
                "รศ.ดร.": staff_mathematics_prof2,
                "อ.ดร.": staff_mathematics_prof4,
                "อ.": staff_mathematics_prof5,
                "ศ.ดร.": staff_mathematics_prof1,
            },
            {
                "department" : "Physics",
                "ผศ.ดร.": staff_physics_prof3,
                "รศ.ดร.": staff_physics_prof2,
                "อ.ดร.": staff_physics_prof4,
                "อ.": staff_physics_prof5,
                "ศ.ดร." : staff_physics_prof1
            },
            {
                "department" : "Biology",
                "ผศ.ดร.": staff_biology_prof3,
                "รศ.ดร.": staff_biology_prof2,
                "อ.ดร.": staff_biology_prof4,
                "อ.": staff_biology_prof5,
                "ศ.ดร." : staff_biology_prof1
            },
            {
                "department" : "Chemistry",
                "ผศ.ดร.": staff_chemistry_prof3,
                "รศ.ดร.": staff_chemistry_prof2,
                "อ.ดร.": staff_chemistry_prof4,
                "อ.": staff_chemistry_prof5,
                "ศ.ดร." : staff_chemistry_prof1
            },          
        ]           

  //  const staff_techcher_all = await staff.count({ where: { stafftype_id: 1 }});
  //  const staff_employee_all = await staff.count({ where: { stafftype_id: 2 }});

    // นับจำนวนนักเรียนที่อยู่ภาควิชาคณิตศาสตร์ (department_id = 1)
    const student_mathematics_count = await student.count({
      include: [
        {
          model: academicProgram,
          required: true, 
          where: {
            department_id: 1
          }
        }
      ]
    });

    // นับจำนวนนักเรียนที่อยู่ภาควิชาฟิสิกส์ (department_id = 2)
    const student_physics_count = await student.count({
      include: [
        {
          model: academicProgram,
          required: true, 
          where: {
            department_id: 2
          }
        }
      ]
    });    

    // นับจำนวนนักเรียนที่อยู่ภาควิชาชีววิทยา (department_id = 3)
    const student_biology_count = await student.count({
      include: [
        {
          model: academicProgram,
          required: true, 
          where: {
            department_id: 3
          }
        }
      ]
    });  
    
    // นับจำนวนนักเรียนที่อยู่ภาควิชาเคมี (department_id = 4)
    const student_chemistry_count = await student.count({
      include: [
        {
          model: academicProgram,
          required: true, 
          where: {
            department_id: 4
          }
        }
      ]
    });       


    // นับจำนวนอาจารย์
   const staff_teacher_mathematics = await staff.count({
        where: {
          [Op.and]: [
            {  department_id: { [Op.eq] : 1 }}, 
            {  stafftype_id: { [Op.eq] : 1 }}       
          ]
        } 
    });    


   const staff_teacher_physics = await staff.count({
        where: {
          [Op.and]: [
            {  department_id: { [Op.eq] : 2 }}, 
            {  stafftype_id: { [Op.eq] : 1 }}       
          ]
        } 
    });    


   const staff_teacher_biology = await staff.count({
        where: {
          [Op.and]: [
            {  department_id: { [Op.eq] : 3 }}, 
            {  stafftype_id: { [Op.eq] : 1 }}       
          ]
        } 
    });  
    
   const staff_teacher_chemistry = await staff.count({
        where: {
          [Op.and]: [
            {  department_id: { [Op.eq] : 4 }}, 
            {  stafftype_id: { [Op.eq] : 1 }}       
          ]
        } 
    });      


// นับจำนวนพนักงาน (สายสนับสนุน)    

   const staff_employee_mathematics = await staff.count({
        where: {
          [Op.and]: [
            {  department_id: { [Op.eq] : 1 }}, 
            {  stafftype_id: { [Op.eq] : 1 }}       
          ]
        } 
    });    

   const staff_employee_physics = await staff.count({
        where: {
          [Op.and]: [
            {  department_id: { [Op.eq] : 2 }}, 
            {  stafftype_id: { [Op.eq] : 2 }}       
          ]
        } 
    });    


   const staff_employee_biology = await staff.count({
        where: {
          [Op.and]: [
            {  department_id: { [Op.eq] : 3 }}, 
            {  stafftype_id: { [Op.eq] : 2 }}       
          ]
        } 
    });  
    
   const staff_employee_chemistry = await staff.count({
        where: {
          [Op.and]: [
            {  department_id: { [Op.eq] : 4 }}, 
            {  stafftype_id: { [Op.eq] : 2 }}       
          ]
        } 
    });  


  let academyWorkResult = [
            {
                "catalog": "Biology",
                "academic": `${staff_teacher_biology + staff_employee_biology}`,
                "student": `${student_biology_count}`,
                "staff": `${staff_employee_biology}`,
                "teacher": `${staff_teacher_biology}`,
            },
            {
                "catalog": "Chemistry",
                "academic": `${staff_teacher_chemistry + staff_employee_chemistry}`,
                "student": `${student_chemistry_count}`,
                "staff": `${staff_employee_chemistry}`,
                "teacher": `${staff_teacher_chemistry}`,
            },
            {
                "catalog": "Physics",
                "academic": `${staff_teacher_physics + staff_employee_physics}`,
                "student": `${student_physics_count}`,
                "staff": `${staff_employee_physics}`,
                "teacher": `${staff_teacher_physics}`,
            },
            {
                "catalog": "Mathematics",
                "academic": `${staff_teacher_mathematics + staff_employee_mathematics}`,
                "student": `${student_mathematics_count}`,
                "staff": `${staff_employee_mathematics}`,
                "teacher": `${staff_teacher_mathematics}`,
            }
        ]

  try {
    let dashboard = {
      academicWork: academyWorkResult,
      academicPosition: academicPositionResult,
      academicPositionDept: academicPositionPerDept,

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
