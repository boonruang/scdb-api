const express = require('express')
const constants = require('../config/constant')
const formidable = require('formidable')
const router = express.Router()
const property = require('../models/property')
const herbal = require('../models/herbal')
const JwtMiddleware = require('../config/Jwt-Middleware')

//  @route                  GET  /api/v2/property/list
//  @desc                   list all propertys
//  @access                 Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get property list API called')
  try {
    const propertyFound = await property.findAll({
      // include: {
      //   model: herbal,
      //  },      
    })
    if (propertyFound) {
      console.log('propertyFound in list API: ', propertyFound)
      res.status(200).json({
        status: 'ok',
        result: propertyFound,
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

//  @route                  GET  /api/v2/property/list
//  @desc                   list all propertys select by Id
//  @access                 Private
router.get('/select/:id',JwtMiddleware.checkToken, async (req, res) => {
  console.log('get property select by id API called')
  let id = req.params.id
  console.log('id',id)  
  try {
    const propertyFound = await property.findOne({
      where : { id },
      include: {
        model: herbal,
      }
    }); 

      if (propertyFound) {
        // console.log('propertyFound in map', propertyFound)
        console.log('propertyFound in map')
        res.status(200).json({
          status: 'ok',
          result: propertyFound,
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

//  @route                  POST  /api/v2/property
//  @desc                   Post add property
//  @access                 Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('property add is called')
  try {
    const form = new formidable.IncomingForm();
    console.log('form.parse(req)',form.parse(req))

    form.parse(req, async (error, fields, files) => {
      let result = await property.create(fields);
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
