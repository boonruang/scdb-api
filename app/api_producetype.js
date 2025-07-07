const express = require('express')
const constants = require('../config/constant')
const formidable = require('formidable')
const router = express.Router()
const producetype = require('../models/producetype')
const herbal = require('../models/herbal')
const JwtMiddleware = require('../config/Jwt-Middleware')
const Sequelize = require('sequelize')
const Op = Sequelize.Op

//  @route                  GET  /api/v2/producetype/list
//  @desc                   list all producetypes
//  @access                 Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get producetype list API called')
  try {
    const producetypeFound = await producetype.findAll({
      where: {
        status: { 
           [Op.eq] :  true
          } 
      },      
    })
    if (producetypeFound) {
      console.log('producetypeFound in list API: ', producetypeFound)
      res.status(200).json({
        status: 'ok',
        result: producetypeFound,
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

//  @route                  GET  /api/v2/producetype/list
//  @desc                   list all producetypes select by Id
//  @access                 Private
router.get('/select/:id', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get producetype select by id API called')
  let id = req.params.id
  console.log('id',id)  
  try {
    const producetypeFound = await producetype.findOne({
      where : { id },
      include: {
        model: herbal,
      }
    }); 

      if (producetypeFound) {
        // console.log('producetypeFound in map', producetypeFound)
        console.log('producetypeFound in map')
        res.status(200).json({
          status: 'ok',
          result: producetypeFound,
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

//  @route                  POST  /api/v2/producetype
//  @desc                   Post add producetype
//  @access                 Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('producetype add is called')
  try {
    const form = new formidable.IncomingForm();
    console.log('form.parse(req)',form.parse(req))

    form.parse(req, async (error, fields, files) => {
      let result = await producetype.create(fields);
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
