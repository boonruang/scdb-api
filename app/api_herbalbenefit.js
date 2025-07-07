const express = require('express')
const constants = require('../config/constant')
const formidable = require('formidable')
const router = express.Router()
const herbalbenefit = require('../models/herbalbenefit')
const benefit = require('../models/benefit')
const herbal = require('../models/herbal')
const JwtMiddleware = require('../config/Jwt-Middleware')

//  @route                  GET  /api/v2/herbalbenefit/list
//  @desc                   list all herbalbenefit
//  @access                 Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get herbalbenefit list API called')
  try {
    const herbalbenefitFound = await herbalbenefit.findAll({
      // include: {
      //    model: herbal,
      //    through: {
      //       model: herbalbenefit
      //    }
      //   },
    })
    if (herbalbenefitFound) {
      console.log('herbalbenefitFound in list API: ', herbalbenefitFound)
      res.status(200).json({
        status: 'ok',
        result: herbalbenefitFound,
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

//  @route                  GET  /api/v2/herbalbenefit/:id
//  @desc                   Get herbalbenefit by Id
//  @access                 Private
router.get('/:id', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get herbalbenefit by Id API called')
  let id = req.params.id

  try {
    const herbalbenefitFound = await herbalbenefit.findOne({
      where: { id },
    })

    if (herbalbenefitFound) {
      // res.status(200).json(herbalbenefitFound)
      res.status(200).json({
        status: 'ok',
        result: herbalbenefitFound,
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

//  @route                  POST  /api/v2/herbalbenefit
//  @desc                   Post add herbalbenefit
//  @access                 Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('herbalbenefit add is called')
  try {
    const form = new formidable.IncomingForm();
    console.log('form.parse(req)',form.parse(req))

    form.parse(req, async (error, fields, files) => {
      let result = await herbalbenefit.create(fields);
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
