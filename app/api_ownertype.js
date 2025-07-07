const express = require('express')
const constants = require('../config/constant')
const formidable = require('formidable')
const router = express.Router()
const ownertype = require('../models/ownertype')
const herbal = require('../models/herbal')
const JwtMiddleware = require('../config/Jwt-Middleware')
const Sequelize = require('sequelize')
const Op = Sequelize.Op

//  @route                  GET  /api/v2/ownertype/list
//  @desc                   list all ownertypes
//  @access                 Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get ownertype list API called')
  try {
    const ownertypeFound = await ownertype.findAll({
      where: {
        status: { 
           [Op.eq] :  true
          } 
      },     
    })
    if (ownertypeFound) {
      console.log('ownertypeFound in list API: ', ownertypeFound)
      res.status(200).json({
        status: 'ok',
        result: ownertypeFound,
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

//  @route                  GET  /api/v2/ownertype/list
//  @desc                   list all ownertypes select by Id
//  @access                 Private
router.get('/select/:id', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get ownertype select by id API called')
  let id = req.params.id
  console.log('id',id)  
  try {
    const ownertypeFound = await ownertype.findOne({
      where : { id },
      include: {
        model: herbal,
      }
    }); 

      if (ownertypeFound) {
        // console.log('ownertypeFound in map', ownertypeFound)
        console.log('ownertypeFound in map')
        res.status(200).json({
          status: 'ok',
          result: ownertypeFound,
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

//  @route                  POST  /api/v2/ownertype
//  @desc                   Post add ownertype
//  @access                 Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('ownertype add is called')
  try {
    const form = new formidable.IncomingForm();
    console.log('form.parse(req)',form.parse(req))

    form.parse(req, async (error, fields, files) => {
      let result = await ownertype.create(fields);
      // result = await uploadImage(files, result);
      console.log('req fields',fields)

      res.json({
        result: constants.kResultOk,
        message: JSON.stringify(result)
      });
    });
  } catch (error) {
    res.json({
      result: constants.kResultNok,
      message: JSON.stringify(error)
    });
  }
});

module.exports = router
