const express = require('express')
const constants = require('../config/constant')
const formidable = require('formidable')
const router = express.Router()
const herbalproperty = require('../models/herbalproperty')
const property = require('../models/property')
const herbal = require('../models/herbal')
const JwtMiddleware = require('../config/Jwt-Middleware')

//  @route                  GET  /api/v2/herbalproperty/list
//  @desc                   list all herbalproperty
//  @access                 Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get herbalproperty list API called')
  try {
    const herbalpropertyFound = await herbalproperty.findAll({
      // include: {
      //    model: herbal,
      //    through: {
      //       model: herbalproperty
      //    }
      //   },
    })
    if (herbalpropertyFound) {
      console.log('herbalpropertyFound in list API: ', herbalpropertyFound)
      res.status(200).json({
        status: 'ok',
        result: herbalpropertyFound,
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

//  @route                  GET  /api/v2/herbalproperty/:id
//  @desc                   Get herbalproperty by Id
//  @access                 Private
router.get('/:id', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get herbalproperty by Id API called')
  let id = req.params.id

  try {
    const herbalpropertyFound = await herbalproperty.findOne({
      where: { id },
    })

    if (herbalpropertyFound) {
      // res.status(200).json(herbalpropertyFound)
      res.status(200).json({
        status: 'ok',
        result: herbalpropertyFound,
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

//  @route                  POST  /api/v2/herbalproperty
//  @desc                   Post add herbalproperty
//  @access                 Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('herbalproperty add is called')
  try {
    const form = new formidable.IncomingForm();
    console.log('form.parse(req)',form.parse(req))

    form.parse(req, async (error, fields, files) => {
      let result = await herbalproperty.create(fields);
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
