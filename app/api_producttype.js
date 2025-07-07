const express = require('express')
const constants = require('../config/constant')
const formidable = require('formidable')
const router = express.Router()
const producttype = require('../models/producttype')
const herbal = require('../models/herbal')
const JwtMiddleware = require('../config/Jwt-Middleware')
const Sequelize = require('sequelize')
const Op = Sequelize.Op

//  @route                  GET  /api/v2/producttype/list
//  @desc                   list all producttypes
//  @access                 Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get producttype list API called')
  try {
    const producttypeFound = await producttype.findAll({
      where: {
        status: { 
           [Op.eq] :  true
          } 
      },      
    })
    if (producttypeFound) {
      console.log('producttypeFound in list API: ', producttypeFound)
      res.status(200).json({
        status: 'ok',
        result: producttypeFound,
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

//  @route                  GET  /api/v2/producttype/list
//  @desc                   list all producttypes select by Id
//  @access                 Private
router.get('/select/:id', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get producttype select by id API called')
  let id = req.params.id
  console.log('id',id)  
  try {
    const producttypeFound = await producttype.findOne({
      where : { id },
      include: {
        model: herbal,
      }
    }); 

      if (producttypeFound) {
        // console.log('producttypeFound in map', producttypeFound)
        console.log('producttypeFound in map')
        res.status(200).json({
          status: 'ok',
          result: producttypeFound,
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

//  @route                  POST  /api/v2/producttype
//  @desc                   Post add producttype
//  @access                 Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('producttype add is called')
  try {
    const form = new formidable.IncomingForm();
    console.log('form.parse(req)',form.parse(req))

    form.parse(req, async (error, fields, files) => {
      let result = await producttype.create(fields);
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
