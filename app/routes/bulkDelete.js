const express = require('express')
const router = express.Router()
const { Op } = require('sequelize')
const sequelize = require('../../config/db-instance')
const BudgetPlan = require('../../models/sciences/budgetPlan')
const BudgetActivity = require('../../models/sciences/budgetActivity')
const BudgetDisbursement = require('../../models/sciences/budgetDisbursement')
const Publication = require('../../models/sciences/publication')
const PublicationAuthor = require('../../models/sciences/publicationAuthor')
const AuthorProfile = require('../../models/sciences/authorProfile')
const constants = require('../../config/constant')
const JwtMiddleware = require('../../config/Jwt-Middleware')
const { ROLES, requireRole } = require('../../config/Role-Middleware')

// ลบข้อมูลแบบกลุ่ม (ข้อเสนอแนะคณะ: Bulk Delete / Clear Data)
// mount ที่ /api/v2/bulkdelete
//   POST /:entity              { ids: [...] }          ลบรายการที่เลือก
//   POST /budget/fiscal-year   { fiscal_year: 2569 }   ล้างงบทั้งปี (เบิกจ่าย → กิจกรรม → แผน) ไว้ import ใหม่
// ทุกครั้งจะถูกบันทึกใน log โดย JwtMiddleware อยู่แล้ว (user + path)

const ENTITIES = {
  budgetplan:         { model: BudgetPlan,         pk: 'plan_id',         role: ROLES.Plan },
  budgetactivity:     { model: BudgetActivity,     pk: 'activity_id',     role: ROLES.Plan },
  budgetdisbursement: { model: BudgetDisbursement, pk: 'disbursement_id', role: ROLES.Plan },
  publication:        { model: Publication,        pk: 'pub_id',          role: ROLES.Research },
  authorprofile:      { model: AuthorProfile,      pk: 'author_id',       role: ROLES.Research },
}

const ok = (res, body) => res.json({ status: constants.kResultOk, ...body })
const nok = (res, msg) => res.json({ status: constants.kResultNok, result: msg })

// ล้างงบประมาณทั้งปีงบ ต้องมาก่อน /:entity
router.post('/budget/fiscal-year', JwtMiddleware.checkToken, requireRole(ROLES.Plan), async (req, res) => {
  try {
    const be = parseInt(req.body && req.body.fiscal_year)
    if (!be || be < 2500) return nok(res, 'ต้องระบุปีงบประมาณ (พ.ศ.)')
    const ce = be - 543

    const result = await sequelize.transaction(async (t) => {
      const plans = await BudgetPlan.findAll({ where: { fiscal_year: ce }, attributes: ['budget_code'], transaction: t })
      const budgetCodes = plans.map((p) => p.budget_code)
      const acts = budgetCodes.length
        ? await BudgetActivity.findAll({ where: { budget_code: { [Op.in]: budgetCodes } }, attributes: ['activity_code'], transaction: t })
        : []
      const activityCodes = acts.map((a) => a.activity_code).filter(Boolean)

      const disbursements = activityCodes.length
        ? await BudgetDisbursement.destroy({ where: { activity_code: { [Op.in]: activityCodes } }, transaction: t })
        : 0
      const activities = budgetCodes.length
        ? await BudgetActivity.destroy({ where: { budget_code: { [Op.in]: budgetCodes } }, transaction: t })
        : 0
      const planCount = await BudgetPlan.destroy({ where: { fiscal_year: ce }, transaction: t })
      return { plans: planCount, activities, disbursements }
    })
    ok(res, { fiscal_year: be, deleted: result })
  } catch (e) { nok(res, e.message) }
})

router.post('/:entity', JwtMiddleware.checkToken, async (req, res, next) => {
  const cfg = ENTITIES[req.params.entity]
  if (!cfg) return nok(res, 'ไม่รู้จักข้อมูลประเภท ' + req.params.entity)
  return requireRole(cfg.role)(req, res, next)
}, async (req, res) => {
  try {
    const cfg = ENTITIES[req.params.entity]
    const ids = Array.isArray(req.body && req.body.ids) ? req.body.ids.map((x) => parseInt(x)).filter(Boolean) : []
    if (!ids.length) return nok(res, 'ไม่ได้เลือกรายการ')

    const deleted = await sequelize.transaction(async (t) => {
      // ผลงานมีตารางผู้แต่งผูกอยู่ ต้องลบ junction ก่อน
      if (cfg.model === Publication) {
        await PublicationAuthor.destroy({ where: { pub_id: { [Op.in]: ids } }, transaction: t })
      }
      return cfg.model.destroy({ where: { [cfg.pk]: { [Op.in]: ids } }, transaction: t })
    })
    ok(res, { deleted })
  } catch (e) { nok(res, e.message) }
})

module.exports = router
