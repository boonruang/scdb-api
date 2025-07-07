const express = require('express')
const constants = require('../config/constant')
const formidable = require('formidable')
const router = express.Router()
const nutrition = require('../models/nutrition')
const herbal = require('../models/herbal')
const JwtMiddleware = require('../config/Jwt-Middleware')

//  @route                  GET  /api/v2/nutrition/list
//  @desc                   list all nutritions
//  @access                 Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get nutrition list API called')
  try {
    const nutritionFound = await nutrition.findAll({
      // include: {
      //   model: herbal,
      //  },      
    })
    if (nutritionFound) {
      console.log('nutritionFound in list API: ', nutritionFound)
      res.status(200).json({
        status: 'ok',
        result: nutritionFound,
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

//  @route                  GET  /api/v2/nutrition/list
//  @desc                   list all nutritions select by Id
//  @access                 Private
router.get('/select/:id', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get nutrition select by id API called')
  let id = req.params.id
  console.log('id',id)  
  try {
    const nutritionFound = await nutrition.findOne({
      where : { id },
      include: {
        model: herbal,
      }
    }); 

      if (nutritionFound) {
        // console.log('nutritionFound in map', nutritionFound)
        console.log('nutritionFound in map')
        res.status(200).json({
          status: 'ok',
          result: nutritionFound,
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

//  @route                  POST  /api/v2/nutrition
//  @desc                   Post add nutrition
//  @access                 Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('nutrition add is called')
  try {
    const form = new formidable.IncomingForm();
    console.log('form.parse(req)',form.parse(req))

    form.parse(req, async (error, fields, files) => {
      let result = await nutrition.create(fields);
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
