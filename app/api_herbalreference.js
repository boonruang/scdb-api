const express = require('express')
const constants = require('../config/constant')
const sequelize = require('../config/db-instance')
const formidable = require('formidable')
const router = express.Router()
const herbalreference = require('../models/herbalreference')
const reference = require('../models/reference')
const herbal = require('../models/herbal')
const JwtMiddleware = require('../config/Jwt-Middleware')

//  @route                  GET  /api/v2/herbalreference/list
//  @desc                   list all herbalreference
//  @access                 Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get herbalreference list API called')
  try {
    const herbalreferenceFound = await herbalreference.findAll({
      // include: {
      //    model: herbal,
      //    through: {
      //       model: herbalreference
      //    }
      //   },
    })
    if (herbalreferenceFound) {
      console.log('herbalreferenceFound in list API: ', herbalreferenceFound)
      res.status(200).json({
        status: 'ok',
        result: herbalreferenceFound,
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

//  @route                  GET  /api/v2/herbalreference/:id
//  @desc                   Get herbalreference by Id
//  @access                 Private
router.get('/:id', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get herbalreference by Id API called')
  let id = req.params.id

  try {
    const herbalreferenceFound = await herbalreference.findOne({
      where: { id },
    })

    if (herbalreferenceFound) {
      // res.status(200).json(herbalreferenceFound)
      res.status(200).json({
        status: 'ok',
        result: herbalreferenceFound,
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

//  @route                  POST  /api/v2/herbalreference
//  @desc                   Post add herbalreference
//  @access                 Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('herbalreference add is called')
  try {
    const form = new formidable.IncomingForm();
    console.log('form.parse(req)',form.parse(req))

    form.parse(req, async (error, fields, files) => {
      let result = await herbalreference.create(fields);
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
