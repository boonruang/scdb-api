const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const { Op } = require('sequelize')
const ResearchAuthor = require('../../models/sciences/researchAuthor')
const publication = require('../../models/sciences/publication')
const publicationAuthor = require('../../models/sciences/publicationAuthor')
const sequelize = require('../../config/db-instance')
const constants = require('../../config/constant')
const JwtMiddleware = require('../../config/Jwt-Middleware')

//  @route              POST  /api/v2/publication
//  @desc               Add publication using formidable
//  @access             Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('publication add is called')
  try {
    const form = new formidable.IncomingForm()
    form.parse(req, async (error, fields, files) => {
        if (error) {
            return res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
        }
        let result = await publication.create(fields)
        res.json({ status: constants.kResultOk, result: result })
    })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/publication/list
//  @desc               List all publications
//  @access             Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const result = await publication.findAll({
      attributes: [
        ['pub_id', 'id'],
        'pub_id',
        'title',
        'journal_name',
        'publication_year',
        'quartile',
        'database_source'
      ],
      include: [
        {
          model: ResearchAuthor,
          through: { attributes: [] },
          attributes: ['research_author_id', 'firstname_th', 'lastname_th', 'firstname', 'lastname']
        }
      ],
      order: [['pub_id', 'DESC']]
    })
    res.json({ status: constants.kResultOk, result: result })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

//  @route              GET  /api/v2/publication/:id
//  @desc               Get publication by id
//  @access             Private
router.get('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    let result = await publication.findOne(
      { 
      where: { pub_id: req.params.id },
      attributes: [ ['pub_id', 'id'], 'pub_id', 'title','journal_name','publication_year','quartile', 'database_source']    
    })    
    if (result) {
      res.json({ status: constants.kResultOk, result: result })
    } else {
      res.json({ status: constants.kResultNok, result: 'Not found' })
    }
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

//  @route              PUT  /api/v2/publication/:id
//  @desc               Update publication by id using formidable
//  @access             Private
router.put('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('publication edit is called')
    try {
        const form = new formidable.IncomingForm()
        form.parse(req, async (error, fields, files) => {
          const { pub_id, ...rest} = fields
            if (error) {
                return res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
            }
            let [rowsUpdated] = await publication.update(fields, { where: { pub_id: pub_id } })
            if (rowsUpdated > 0) {
                let result = await publication.findOne({ where: { pub_id: pub_id } })
                res.json({ status: constants.kResultOk, result: result })
            } else {
                res.json({ status: constants.kResultNok, result: 'Update failed, record not found or no new data.' })
            }
        })
    } catch (error) {
        res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
    }
})

//  @route              DELETE  /api/v2/publication/:id
//  @desc               Delete publication by id
//  @access             Private
router.delete('/:id', JwtMiddleware.checkToken, async (req, res) => {
  console.log('publication delete is called')
  console.log('param id ',req.params.id)
    try {
        const deleted = await publication.destroy({ where: { pub_id: req.params.id } })
        if (deleted) {
            res.json({ result: constants.kResultOk, message: 'Record deleted successfully.' })
        } else {
            res.json({ result: constants.kResultNok, message: 'Record not found.' })
        }
    } catch (error) {
        res.json({ result: constants.kResultNok, message: JSON.stringify(error) })
    }
})

//  @route              POST  /api/v2/publication/bulk
//  @desc               Bulk import publications from Excel (Paper sheet) + create author links
//  @access             Private
router.post('/bulk', JwtMiddleware.checkToken, async (req, res) => {
  try {
    // รองรับทั้ง format เก่า (array) และใหม่ ({ publications, author_links })
    var records = Array.isArray(req.body) ? req.body : (req.body.publications || [])
    var links = Array.isArray(req.body.author_links) ? req.body.author_links : []

    if (!records.length) {
      return res.json({ status: constants.kResultNok, result: 'No data provided' })
    }

    // Step 1: upsert ทีละเรื่อง กันผลงานซ้ำเมื่อ import ไฟล์เดิมหรือไฟล์ปีถัดไป
    // ไม่ใช้ ID(P) เป็น key เพราะเลข P1, P2 เป็นลำดับในไฟล์ ไฟล์ใหม่อาจเริ่มนับใหม่
    // key: DOI (ถ้ามี) ไม่งั้นใช้ ชื่อเรื่อง + ปีที่เผยแพร่ (ไม่สนตัวพิมพ์/ช่องว่าง)
    var inserted = 0, updated = 0
    var pubMap = {}   // ID(P) ในไฟล์นี้ → pub_id ใน DB สำหรับผูกผู้แต่ง
    for (var i = 0; i < records.length; i++) {
      var r = records[i]
      var doi = String(r.doi || '').trim()
      var title = String(r.title || '').trim().replace(/\s+/g, ' ')
      var where = doi
        ? { doi: doi }
        : { publication_year: r.publication_year, [Op.and]: [sequelize.where(
            sequelize.fn('lower', sequelize.fn('regexp_replace', sequelize.fn('trim', sequelize.col('title')), '\\s+', ' ', 'g')),
            title.toLowerCase()
          )] }
      var existing = title || doi ? await publication.findOne({ where: where, attributes: ['pub_id'] }) : null
      var pubId
      if (existing) {
        // ช่องที่ไฟล์ใหม่เว้นว่าง ไม่เขียนทับค่าเดิม (เช่น DOI ที่เคยกรอกไว้)
        var changes = {}
        Object.keys(r).forEach(function(k) {
          if (k !== 'pub_id' && r[k] !== '' && r[k] !== null && r[k] !== undefined) changes[k] = r[k]
        })
        if (changes.title) changes.title = title
        await publication.update(changes, { where: { pub_id: existing.pub_id } })
        pubId = existing.pub_id
        updated++
      } else {
        var row = await publication.create(Object.assign({}, r, { title: title || r.title }))
        pubId = row.pub_id
        inserted++
      }
      if (r.spreadsheet_id) pubMap[r.spreadsheet_id] = pubId
    }

    // Step 3: สร้าง PublicationAuthor links
    var linksCreated = 0
    if (links.length > 0) {
      var authorSpreadsheetIds = links.map(function(l) { return l.author_spreadsheet_id }).filter(Boolean)
      var uniqueAuthorIds = authorSpreadsheetIds.filter(function(v, i, a) { return a.indexOf(v) === i })
      var authorRows = await ResearchAuthor.findAll({
        where: { spreadsheet_id: { [Op.in]: uniqueAuthorIds } },
        attributes: ['research_author_id', 'spreadsheet_id']
      })
      var authorMap = {}
      authorRows.forEach(function(a) { authorMap[a.spreadsheet_id] = a.research_author_id })

      var junctions = []
      links.forEach(function(link) {
        var pubId = pubMap[link.pub_spreadsheet_id]
        var authorId = authorMap[link.author_spreadsheet_id]
        if (pubId && authorId) junctions.push({ pub_id: pubId, research_author_id: authorId })
      })
      if (junctions.length > 0) {
        await publicationAuthor.bulkCreate(junctions, { ignoreDuplicates: true })
        linksCreated = junctions.length
      }
    }

    res.json({ status: constants.kResultOk, count: inserted + updated, inserted, updated, links_count: linksCreated })
  } catch (error) {
    res.json({ status: constants.kResultNok, result: JSON.stringify(error) })
  }
})

module.exports = router
