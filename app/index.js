const express = require('express')
const cors = require('cors')
require('dotenv').config();
const sequelize = require('../config/db-instance') // 1. IMPORT SEQUELIZE INSTANCE

const app = express()

const DEFAULT_PORT = process.env.NODE_ENV_SERVICE_PORT

const CORS_ORIGIN = process.env.CORS_ORIGIN || '*'
app.use(cors({ origin: CORS_ORIGIN }))
app.use(express.urlencoded({ extended: false, limit: '10mb' }))
app.use(express.json({ limit: '10mb' }))

// =================================================================
// 2. IMPORT MODELS (ส่วนที่เพิ่มเข้ามา)
// =================================================================
const Department = require('../models/sciences/department');
const Staff = require('../models/sciences/staff');
const Stafftype = require('../models/sciences/stafftype');
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
const StudentAward = require('../models/sciences/studentAward');
const StudentActivity = require('../models/sciences/studentActivity');
const Document = require('../models/sciences/document');
const Major = require('../models/sciences/major');
const ResearchAuthor = require('../models/sciences/researchAuthor');
const AcademicResearch = require('../models/sciences/academicResearch');
const Division = require('../models/sciences/division');


// =================================================================
// 3. DEFINE ASSOCIATIONS (ส่วนที่เพิ่มเข้ามา - สำคัญมาก)
// =================================================================
// Stafftype Relationships
Stafftype.hasMany(Staff, { foreignKey: 'stafftype_id', constraints: false });


// Department Relationships
Department.hasMany(Staff, { foreignKey: 'department_id', constraints: false });
Department.hasMany(AcademicProgram, { foreignKey: 'department_id' });
Department.hasMany(Project, { foreignKey: 'responsible_dept_id' });
Department.hasMany(Document, { foreignKey: 'department_id' });

// Division Relationships
Division.hasMany(Staff, { foreignKey: 'division_id', constraints: false });
Staff.belongsTo(Division, { foreignKey: 'division_id', constraints: false });

// Staff Relationships
Staff.belongsTo(Department, { foreignKey: 'department_id', constraints: false });
Staff.belongsTo(Stafftype, { foreignKey: 'stafftype_id', constraints: false });
Staff.hasMany(StaffEducation, { foreignKey: 'staff_id' });
Staff.hasMany(LeaveRecord, { foreignKey: 'staff_id' });
Staff.belongsToMany(Project, { through: ProjectStaff, foreignKey: 'staff_id', otherKey: 'project_id' });
// Publication Relationships — ใช้ ResearchAuthor เป็น FK กลาง (sync มาจาก AuthorProfile + AuthorProfileSupport)
ResearchAuthor.belongsToMany(Publication, { through: PublicationAuthor, foreignKey: 'research_author_id', otherKey: 'pub_id' });
Publication.belongsToMany(ResearchAuthor, { through: PublicationAuthor, foreignKey: 'pub_id', otherKey: 'research_author_id' });

PublicationAuthor.belongsTo(Publication, { foreignKey: 'pub_id' });
PublicationAuthor.belongsTo(ResearchAuthor, { foreignKey: 'research_author_id' });


// AcademicProgram Relationships
AcademicProgram.belongsTo(Department, { foreignKey: 'department_id' });
AcademicProgram.hasMany(AdmissionPlan, { foreignKey: 'program_id' });
AdmissionPlan.belongsTo(AcademicProgram, { foreignKey: 'program_id' });

// Student Relationships
Student.hasMany(StudentGrant, { foreignKey: 'student_id' });
Student.hasMany(StudentAward, { foreignKey: 'student_id' });
StudentAward.belongsTo(Student, { foreignKey: 'student_id' });

// Major Relationships
Department.hasMany(Major, { foreignKey: 'department_id' });
Major.belongsTo(Department, { foreignKey: 'department_id' });

// Project Relationships
Project.belongsTo(Department, { foreignKey: 'responsible_dept_id' });
Project.belongsToMany(Staff, { through: ProjectStaff, foreignKey: 'project_id', otherKey: 'staff_id' });
Project.hasMany(Document, { foreignKey: 'project_id', allowNull: true });

// Document Relationships
Document.belongsTo(Department, { foreignKey: 'department_id' });
Document.belongsTo(Project, { foreignKey: 'project_id' });

// Other relationships
StaffEducation.belongsTo(Staff, { foreignKey: 'staff_id' });
LeaveRecord.belongsTo(Staff, { foreignKey: 'staff_id' });
AdmissionPlan.belongsTo(AcademicProgram, { foreignKey: 'program_id' });
StudentGrant.belongsTo(Student, { foreignKey: 'student_id' });


// =================================================================
// API ROUTES
// =================================================================
// --- v2: New Dashboards ---
app.use('/api/v2/dashboard/research', require('./routes/researchDashboard'))
app.use('/api/v2/dashboard/budget',   require('./routes/budgetDashboard'))
app.use('/api/v2/budgetplan',         require('./routes/budgetPlan'))
app.use('/api/v2/budgetactivity',     require('./routes/budgetActivity'))
app.use('/api/v2/budgetdisbursement', require('./routes/budgetDisbursement'))

// --- v2 (เดิม) ---
// --- โปรเจคเก่า ---
app.use('/api/v2/dashboard1', require('./routes/dashboard1'))
app.use('/api/v2/dashboard2', require('./routes/dashboard2'))
app.use('/api/v2/dashboard3', require('./routes/dashboard3'))
app.use('/api/v2/dashboard6', require('./routes/dashboard6'))
app.use('/api/v2/academic',   require('./routes/academic'))
// ... (โค้ด routes เดิมทั้งหมด)
app.use('/api/v2/role', require('./routes/role'))

// --- โปรเจคใหม่ (คณะวิทย์) ---
app.use('/api/v2/department', require('./routes/department'));
app.use('/api/v2/division', require('./routes/division'));
app.use('/api/v2/staff', require('./routes/staff'));
app.use('/api/v2/staffeducation', require('./routes/staffEducation'));
app.use('/api/v2/leaverecord', require('./routes/leaveRecord'));
app.use('/api/v2/academicprogram', require('./routes/academicProgram'));
app.use('/api/v2/academicgrant',  require('./routes/academicGrant'));
app.use('/api/v2/student', require('./routes/student'));
app.use('/api/v2/stafftype', require('./routes/stafftype'));
app.use('/api/v2/admissionplan', require('./routes/admissionPlan'));
app.use('/api/v2/project', require('./routes/project'));
app.use('/api/v2/projectstaff', require('./routes/projectStaff'));
app.use('/api/v2/publication', require('./routes/publication'));
app.use('/api/v2/publicationauthor', require('./routes/publicationAuthor'));
app.use('/api/v2/studentgrant', require('./routes/studentGrant'));
app.use('/api/v2/studentaward', require('./routes/studentAward'));
app.use('/api/v2/studentactivity', require('./routes/studentActivity'));
app.use('/api/v2/document', require('./routes/document'))
app.use('/api/v2/major', require('./routes/major'));
app.use('/api/v2/authorprofile', require('./routes/authorProfile'));
app.use('/api/v2/authorprofilesupport', require('./routes/authorProfileSupport'));
app.use('/api/v2/log', require('./routes/log'))
app.use('/api/v2/user', require('./routes/user'))
app.use('/api/v2/auth', require('./routes/auth'))
app.use('/api/v2/role', require('./routes/role'))


// =================================================================
// 4. START SERVER WITH CONTROLLED SYNC (ส่วนที่แก้ไข)
// =================================================================
const PORT = DEFAULT_PORT || 5000

// Start server immediately, sync DB in background
app.listen(PORT, () => {
  console.log('\x1b[36m%s\x1b[0m', `listening on port:${PORT}`)
})

sequelize.sync({ alter: true }).then(async () => {
  console.log('✅ Database & tables synced!');

  // ── Seed: Stafftype ──────────────────────────────────────────────
  try {
    var STAFFTYPE_SEEDS = [
      { stafftype_id: 1, name: 'อาจารย์' },
      { stafftype_id: 2, name: 'สายสนับสนุน' },
    ]
    for (var ti = 0; ti < STAFFTYPE_SEEDS.length; ti++) {
      await Stafftype.findOrCreate({
        where: { stafftype_id: STAFFTYPE_SEEDS[ti].stafftype_id },
        defaults: STAFFTYPE_SEEDS[ti]
      })
    }
    console.log('✅ Stafftypes seeded')
  } catch (e) {
    console.error('Seed Stafftype error:', e.message)
  }

  // ── Seed: Divisions (สังกัดบุคลากร) ─────────────────────────────
  try {
    var DIV_SEEDS = [
      'ภาควิชาคณิตศาสตร์',
      'ภาควิชาชีววิทยา',
      'ภาควิชาฟิสิกส์',
      'ภาควิชาเคมี',
      'สำนักงานเลขานุการ',
      'โครงการ วมว.',
    ]
    for (var si = 0; si < DIV_SEEDS.length; si++) {
      await Division.findOrCreate({
        where: { division_name: DIV_SEEDS[si] },
        defaults: { division_name: DIV_SEEDS[si] }
      })
    }
    console.log('✅ Divisions seeded')
  } catch (e) {
    console.error('Seed Divisions error:', e.message)
  }
  // ─────────────────────────────────────────────────────────────────

}).catch(error => {
    console.error('Unable to sync database:', error);
});
