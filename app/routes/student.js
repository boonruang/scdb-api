const express = require('express')
const router = express.Router()
const student = require('../../models/sciences/student')
const constants = require('../../config/constant')
const JwtMiddleware = require('../../config/Jwt-Middleware')
const AcademicProgram = require('../../models/sciences/academicProgram')
const Staff = require('../../models/sciences/staff')

//  @route              POST  /api/v2/student
//  @desc               Add student
//  @access             Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await student.create(req.body)
    res.json({ result: constants.kResultOk, message: result })
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/student/list
//  @desc               List all students
//  @access             Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await student.findAll({
      include: [
        {
          model: AcademicProgram,
          attributes: ['program_name'] // เลือกเฉพาะชื่อโปรแกรม
        },
        {
          model: Staff,
          as: 'advisor', // ใช้ alias ที่ตั้งไว้ใน association
          attributes: ['name'] // เลือกเฉพาะชื่ออาจารย์ที่ปรึกษา
        }
      ],
      // ไม่ต้องแสดง ID ของตารางที่เชื่อมมา เพื่อให้ข้อมูลกระชับ
        attributes: [
            ['student_id', 'id'], // สร้าง alias 'id' จาก 'student_id'
            'student_id',
            'name'
        ] 
       
    })

    res.json({ status: constants.kResultOk, result: result })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/student/:id
//  @desc               Get student by id
//  @access             Private
router.get('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
        const result = await student.findOne({
      where: { student_id: req.params.id },
      include: [
        {
          model: AcademicProgram,
          attributes: ['program_name']
        },
        {
          model: Staff,
          as: 'advisor',
          attributes: ['name']
        }
      ],
      // แก้ไข: เพิ่ม property 'id' สำหรับ MUI Data Grid โดยยังคง student_id ไว้
      attributes: [
          ['student_id', 'id'], // สร้าง alias 'id' จาก 'student_id'
          'student_id',
          'name'
      ]
    });
    if (result) {
      res.json({ status: constants.kResultOk, result: result })
    } else {
      res.json({ status: constants.kResultNok, result: 'Not found' })
    }
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

module.exports = router