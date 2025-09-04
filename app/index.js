const express = require('express')
const cors = require('cors')
require('dotenv').config();
const sequelize = require('../config/db-instance') // 1. IMPORT SEQUELIZE INSTANCE

const app = express()

const DEFAULT_PORT = process.env.NODE_ENV_SERVICE_PORT

app.use(cors({origin: '*'}))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// =================================================================
// 2. IMPORT MODELS (ส่วนที่เพิ่มเข้ามา)
// =================================================================
const Department = require('../models/sciences/department');
const Staff = require('../models/sciences/staff');
const StaffEducation = require('../models/sciences/staffEducation');
const LeaveRecord = require('../models/sciences/leaveRecord');
const AcademicProgram = require('../models/sciences/academicProgram');
const Student = require('../models/sciences/student');
const AdmissionPlan = require('../models/sciences/admissionPlan');
const Project = require('../models/sciences/project');
const ProjectStaff = require('../models/sciences/projectStaff');
const Publication = require('../models/sciences/publication');
const PublicationAuthor = require('../models/sciences/publicationAuthor');
const StudentGrant = require('../models/sciences/studentGrant');
const Document = require('../models/sciences/document');


// =================================================================
// 3. DEFINE ASSOCIATIONS (ส่วนที่เพิ่มเข้ามา - สำคัญมาก)
// =================================================================
// Department Relationships
Department.hasMany(Staff, { foreignKey: 'department_id' });
Department.hasMany(AcademicProgram, { foreignKey: 'department_id' });
Department.hasMany(Project, { foreignKey: 'responsible_dept_id' });
Department.hasMany(Document, { foreignKey: 'department_id' });

// Staff Relationships
Staff.belongsTo(Department, { foreignKey: 'department_id' });
Staff.hasMany(StaffEducation, { foreignKey: 'staff_id' });
Staff.hasMany(LeaveRecord, { foreignKey: 'staff_id' });
Staff.hasMany(Student, { foreignKey: 'advisor_staff_id' });
Staff.belongsToMany(Project, { through: ProjectStaff, foreignKey: 'staff_id', otherKey: 'project_id' });
Staff.belongsToMany(Publication, { through: PublicationAuthor, foreignKey: 'staff_id', otherKey: 'pub_id' });

// AcademicProgram Relationships
AcademicProgram.belongsTo(Department, { foreignKey: 'department_id' });
AcademicProgram.hasMany(Student, { foreignKey: 'program_id' });
AcademicProgram.hasMany(AdmissionPlan, { foreignKey: 'program_id' });

// Student Relationships
Student.belongsTo(AcademicProgram, { foreignKey: 'program_id' });
Student.belongsTo(Staff, { as: 'advisor', foreignKey: 'advisor_staff_id' });
Student.hasMany(StudentGrant, { foreignKey: 'student_id' });

// Project Relationships
Project.belongsTo(Department, { foreignKey: 'responsible_dept_id' });
Project.belongsToMany(Staff, { through: ProjectStaff, foreignKey: 'project_id', otherKey: 'staff_id' });
Project.hasMany(Document, { foreignKey: 'project_id', allowNull: true });

// Publication Relationships
Publication.belongsToMany(Staff, { through: PublicationAuthor, foreignKey: 'pub_id', otherKey: 'staff_id' });

// Document Relationships
Document.belongsTo(Department, { foreignKey: 'department_id' });
Document.belongsTo(Project, { foreignKey: 'project_id' });

// Other relationships
StaffEducation.belongsTo(Staff, { foreignKey: 'staff_id' });
LeaveRecord.belongsTo(Staff, { foreignKey: 'staff_id' });
AdmissionPlan.belongsTo(AcademicProgram, { foreignKey: 'program_id' });
StudentGrant.belongsTo(Student, { foreignKey: 'student_id' });


// =================================================================
// API ROUTES (โค้ดเดิมของคุณ)
// =================================================================
// --- โปรเจคเก่า ---
app.use('/api/v2/dashboard', require('./routes/dashboard'))
// ... (โค้ด routes เดิมทั้งหมด)
app.use('/api/v2/role', require('./routes/role'))

// --- โปรเจคใหม่ (คณะวิทย์) ---
app.use('/api/v2/department', require('./routes/department'));
app.use('/api/v2/staff', require('./routes/staff'));
app.use('/api/v2/staffeducation', require('./routes/staffEducation'));
app.use('/api/v2/leaverecord', require('./routes/leaveRecord'));
app.use('/api/v2/academicprogram', require('./routes/academicProgram'));
app.use('/api/v2/student', require('./routes/student'));
app.use('/api/v2/staff', require('./routes/staff'));
app.use('/api/v2/admissionplan', require('./routes/admissionPlan'));
app.use('/api/v2/project', require('./routes/project'));
app.use('/api/v2/projectstaff', require('./routes/projectStaff'));
app.use('/api/v2/publication', require('./routes/publication'));
app.use('/api/v2/publicationauthor', require('./routes/publicationAuthor'));
app.use('/api/v2/studentgrant', require('./routes/studentGrant'));
app.use('/api/v2/document', require('./routes/document'));
app.use('/api/v2/log', require('./routes/log'))
app.use('/api/v2/user', require('./routes/user'))
app.use('/api/v2/auth', require('./routes/auth'))
app.use('/api/v2/role', require('./routes/role'))


// =================================================================
// 4. START SERVER WITH CONTROLLED SYNC (ส่วนที่แก้ไข)
// =================================================================
const PORT = DEFAULT_PORT || 5000

sequelize.sync({ force: false }).then(() => {
  console.log('✅ Database & tables created!');
  app.listen(PORT, () => {
    console.log('\x1b[36m%s\x1b[0m', `listening on port:${PORT}`)
  })
}).catch(error => {
    console.error('Unable to sync database:', error);
});
