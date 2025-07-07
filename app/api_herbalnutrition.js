const express = require('express')
const constants = require('../config/constant')
const formidable = require('formidable')
const router = express.Router()
const herbalnutrition = require('../models/herbalnutrition')
const nutrition = require('../models/nutrition')
const herbal = require('../models/herbal')
const JwtMiddleware = require('../config/Jwt-Middleware')

//  @route                  GET  /api/v2/herbalnutrition/list
//  @desc                   list all herbalnutrition
//  @access                 Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get herbalnutrition list API called')
  try {
    const herbalnutritionFound = await herbalnutrition.findAll({
      // include: {
      //    model: herbal,
      //    through: {
      //       model: herbalnutrition
      //    }
      //   },
    })
    if (herbalnutritionFound) {
      console.log('herbalnutritionFound in list API: ', herbalnutritionFound)
      res.status(200).json({
        status: 'ok',
        result: herbalnutritionFound,
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

//  @route                  GET  /api/v2/herbalnutrition/:id
//  @desc                   Get herbalnutrition by Id
//  @access                 Private
router.get('/:id', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get herbalnutrition by Id API called')
  let id = req.params.id

  try {
    const herbalnutritionFound = await herbalnutrition.findOne({
      where: { id },
    })

    if (herbalnutritionFound) {
      // res.status(200).json(herbalnutritionFound)
      res.status(200).json({
        status: 'ok',
        result: herbalnutritionFound,
      })
    } else {
      res.status(500).json({
        result: 'not found',
      })
    }
  } catch (error) {
    res.status(500).json({
      error,
    })
  }
})

//  @route                  POST  /api/v2/herbalnutrition
//  @desc                   Post add herbalnutrition
//  @access                 Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('herbalnutrition add is called')
  try {
    const form = new formidable.IncomingForm();
    console.log('form.parse(req)',form.parse(req))

    form.parse(req, async (error, fields, files) => {
      let result = await herbalnutrition.create(fields);
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
