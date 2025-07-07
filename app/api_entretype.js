const express = require('express')
const constants = require('../config/constant')
const formidable = require('formidable')
const router = express.Router()
const entretype = require('../models/entretype')
const herbal = require('../models/herbal')
const JwtMiddleware = require('../config/Jwt-Middleware')
const Sequelize = require('sequelize')
const Op = Sequelize.Op

//  @route                  GET  /api/v2/entretype/list
//  @desc                   list all entretypes
//  @access                 Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get entretype list API called')
  try {
    const entretypeFound = await entretype.findAll({
      where: {
        status: { 
           [Op.eq] :  true
          } 
      },      
    })
    if (entretypeFound) {
      console.log('entretypeFound in list API: ', entretypeFound)
      res.status(200).json({
        status: 'ok',
        result: entretypeFound,
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

//  @route                  GET  /api/v2/entretype/list
//  @desc                   list all entretypes select by Id
//  @access                 Private
router.get('/select/:id', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get entretype select by id API called')
  let id = req.params.id
  console.log('id',id)  
  try {
    const entretypeFound = await entretype.findOne({
      where : { id },
      include: {
        model: herbal,
      }
    }); 

      if (entretypeFound) {
        // console.log('entretypeFound in map', entretypeFound)
        console.log('entretypeFound in map')
        res.status(200).json({
          status: 'ok',
          result: entretypeFound,
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

//  @route                  POST  /api/v2/entretype
//  @desc                   Post add entretype
//  @access                 Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('entretype add is called')
  try {
    const form = new formidable.IncomingForm();
    console.log('form.parse(req)',form.parse(req))

    form.parse(req, async (error, fields, files) => {
      let result = await entretype.create(fields);
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
