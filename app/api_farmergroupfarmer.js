const express = require('express')
const constants = require('../config/constant')
const formidable = require('formidable')
const router = express.Router()
const farmergroupfarmer = require('../models/farmergroupfarmer')
const JwtMiddleware = require('../config/Jwt-Middleware')

//  @route                  GET  /api/v2/farmergroupfarmer/list
//  @desc                   list all farmergroupfarmers
//  @access                 Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get farmergroupfarmer list API called')
  try {
    const farmergroupfarmerFound = await farmergroupfarmer.findAll({
      // include: {
      //    model: farmer,
      //    through: {
      //       model: farmergroupfarmer
      //    }
      //   },
    })
    if (farmergroupfarmerFound) {
      console.log('farmergroupfarmerFound in list API: ', farmergroupfarmerFound)
      res.status(200).json({
        status: 'ok',
        result: farmergroupfarmerFound,
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

//  @route                  GET  /api/v2/farmergroupfarmer/:id
//  @desc                   Get farmergroupfarmer by Id
//  @access                 Private
router.get('/:id', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get farmergroupfarmer by Id API called')
  let id = req.params.id

  try {
    const farmergroupfarmerFound = await farmergroupfarmer.findOne({
      where: { id },
    })

    if (farmergroupfarmerFound) {
      // res.status(200).json(farmergroupfarmerFound)
      res.status(200).json({
        status: 'ok',
        result: farmergroupfarmerFound,
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

//  @route                  POST  /api/v2/farmergroupfarmer
//  @desc                   Post add farmergroupfarmer
//  @access                 Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('farmergroupfarmer add is called')
  try {
    const form = new formidable.IncomingForm();
    console.log('form.parse(req)',form.parse(req))

    form.parse(req, async (error, fields, files) => {
      let result = await farmergroupfarmer.create(fields);
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
