const express = require('express')
const constants = require('../config/constant')
const formidable = require('formidable')
const router = express.Router()
const benefit = require('../models/benefit')
const herbal = require('../models/herbal')
const JwtMiddleware = require('../config/Jwt-Middleware')

//  @route                  GET  /api/v2/benefit/list
//  @desc                   list all benefits
//  @access                 Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get benefit list API called')
  try {
    const benefitFound = await benefit.findAll({
      // include: {
      //   model: herbal,
      //  },      
    })
    if (benefitFound) {
      console.log('benefitFound in list API: ', benefitFound)
      res.status(200).json({
        status: 'ok',
        result: benefitFound,
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

//  @route                  GET  /api/v2/benefit/list
//  @desc                   list all benefits select by Id
//  @access                 Private
router.get('/select/:id', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get benefit select by id API called')
  let id = req.params.id
  console.log('id',id)  
  try {
    const benefitFound = await benefit.findOne({
      where : { id },
      include: {
        model: herbal,
      }
    }); 

      if (benefitFound) {
        // console.log('benefitFound in map', benefitFound)
        console.log('benefitFound in map')
        res.status(200).json({
          status: 'ok',
          result: benefitFound,
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

//  @route                  POST  /api/v2/benefit
//  @desc                   Post add benefit
//  @access                 Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('benefit add is called')
  try {
    const form = new formidable.IncomingForm();
    console.log('form.parse(req)',form.parse(req))

    form.parse(req, async (error, fields, files) => {
      let result = await benefit.create(fields);
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
