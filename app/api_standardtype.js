const express = require('express')
const constants = require('../config/constant')
const formidable = require('formidable')
const router = express.Router()
const standardtype = require('../models/standardtype')
const herbal = require('../models/herbal')
const JwtMiddleware = require('../config/Jwt-Middleware')
const Sequelize = require('sequelize')
const Op = Sequelize.Op

//  @route                  GET  /api/v2/standardtype/list
//  @desc                   list all standardtypes
//  @access                 Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get standardtype list API called')
  try {
    const standardtypeFound = await standardtype.findAll({
      where: {
        status: { 
           [Op.eq] :  true
          } 
      },      
    })
    if (standardtypeFound) {
      console.log('standardtypeFound in list API: ', standardtypeFound)
      res.status(200).json({
        status: 'ok',
        result: standardtypeFound,
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

//  @route                  GET  /api/v2/standardtype/list
//  @desc                   list all standardtypes select by Id
//  @access                 Private
router.get('/select/:id', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get standardtype select by id API called')
  let id = req.params.id
  console.log('id',id)  
  try {
    const standardtypeFound = await standardtype.findOne({
      where : { id },
      include: {
        model: herbal,
      }
    }); 

      if (standardtypeFound) {
        // console.log('standardtypeFound in map', standardtypeFound)
        console.log('standardtypeFound in map')
        res.status(200).json({
          status: 'ok',
          result: standardtypeFound,
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

//  @route                  POST  /api/v2/standardtype
//  @desc                   Post add standardtype
//  @access                 Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('standardtype add is called')
  try {
    const form = new formidable.IncomingForm();
    console.log('form.parse(req)',form.parse(req))

    form.parse(req, async (error, fields, files) => {
      let result = await standardtype.create(fields);
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
