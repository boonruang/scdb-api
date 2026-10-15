// ตรวจสิทธิ์ฝั่ง server จาก roles ใน JWT (ใส่หลัง JwtMiddleware.checkToken ซึ่งตั้ง res.user)
// รหัสตรงกับ ROLES ใน scdb-dashboard/src/constants/index.js
const ROLES = {
  User: 2001,
  Editor: 1976,
  Admin: 5150,
  HR: 4001,
  Student: 5001,
  Academic: 6001,
  Research: 7001,
  Plan: 8001,
}

// Admin ผ่านเสมอ ที่เหลือต้องมีอย่างน้อยหนึ่ง role ที่ระบุ
const requireRole = (...allowed) => (req, res, next) => {
  const roles = (res.user && res.user.roles) || []
  if (roles.includes(ROLES.Admin) || roles.some((r) => allowed.includes(r))) return next()
  return res.status(403).json({ status: 'nok', result: 'ไม่มีสิทธิ์ดำเนินการ' })
}

module.exports = { ROLES, requireRole }
