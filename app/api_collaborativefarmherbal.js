const express = require('express')
const constants = require('../config/constant')
const formidable = require('formidable')
const router = express.Router()
const collaborativefarmherbal = require('../models/collaborativefarmherbal')
const collaborativefarm = require('../models/collaborativefarm')
const herbal = require('../models/herbal')
const JwtMiddleware = require('../config/Jwt-Middleware')

//  @route                  GET  /api/v2/collaborativefarmherbal/list
//  @desc                   list all collaborativefarmherbals
//  @access                 Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get collaborativefarmherbal list API called')
  try {
    const collaborativefarmherbalFound = await collaborativefarmherbal.findAll({
    })
    if (collaborativefarmherbalFound) {
      console.log('collaborativefarmherbalFound in list API: ', collaborativefarmherbalFound)
      res.status(200).json({
        status: 'ok',
        result: collaborativefarmherbalFound,
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

//  @route                  GET  /api/v2/collaborativefarmherbal/:id
//  @desc                   Get collaborativefarmherbal by Id
//  @access                 Private
router.get('/:id', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get collaborativefarmherbal by Id API called')
  let id = req.params.id

  try {
    const collaborativefarmherbalFound = await collaborativefarmherbal.findOne({
      where: { id },
        // include: {
        //  model: herbal,
        //  through: {
        //     model: collaborativefarmherbal
        //  }
        // },
    })

    if (collaborativefarmherbalFound) {
      // res.status(200).json(collaborativefarmherbalFound)
      res.status(200).json({
        status: 'ok',
        result: collaborativefarmherbalFound,
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

//  @route                  POST  /api/v2/collaborativefarmherbal
//  @desc                   Post add collaborativefarmherbal
//  @access                 Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('collaborativefarmherbal add is called')
  try {
    const form = new formidable.IncomingForm();
    console.log('form.parse(req)',form.parse(req))

    form.parse(req, async (error, fields, files) => {
      let result = await collaborativefarmherbal.create(fields);
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
