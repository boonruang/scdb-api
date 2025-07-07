const express = require('express')
const constants = require('../config/constant')
const formidable = require('formidable')
const router = express.Router()
const herbalcharacter = require('../models/herbalcharacter')
const character = require('../models/character')
const herbal = require('../models/herbal')
const JwtMiddleware = require('../config/Jwt-Middleware')

//  @route                  GET  /api/v2/herbalcharacter/list
//  @desc                   list all herbalcharacter
//  @access                 Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get herbalcharacter list API called')
  try {
    const herbalcharacterFound = await herbalcharacter.findAll({
      // include: {
      //    model: herbal,
      //    through: {
      //       model: herbalcharacter
      //    }
      //   },
    })
    if (herbalcharacterFound) {
      console.log('herbalcharacterFound in list API: ', herbalcharacterFound)
      res.status(200).json({
        status: 'ok',
        result: herbalcharacterFound,
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

//  @route                  GET  /api/v2/herbalcharacter/:id
//  @desc                   Get herbalcharacter by Id
//  @access                 Private
router.get('/:id', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get herbalcharacter by Id API called')
  let id = req.params.id

  try {
    const herbalcharacterFound = await herbalcharacter.findOne({
      where: { id },
    })

    if (herbalcharacterFound) {
      // res.status(200).json(herbalcharacterFound)
      res.status(200).json({
        status: 'ok',
        result: herbalcharacterFound,
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

//  @route                  POST  /api/v2/herbalcharacter
//  @desc                   Post add herbalcharacter
//  @access                 Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('herbalcharacter add is called')
  try {
    const form = new formidable.IncomingForm();
    console.log('form.parse(req)',form.parse(req))

    form.parse(req, async (error, fields, files) => {
      let result = await herbalcharacter.create(fields);
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
