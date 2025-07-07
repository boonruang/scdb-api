const express = require('express')
const constants = require('../config/constant')
const formidable = require('formidable')
const router = express.Router()
const herbalimage = require('../models/herbalimage')
const JwtMiddleware = require('../config/Jwt-Middleware')

//  @route                  GET  /api/v2/herbalimage/list
//  @desc                   list all herbalimage
//  @access                 Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get herbalimage list API called')
  try {
    const herbalimageFound = await herbalimage.findAll()
    if (herbalimageFound) {
      console.log('herbalimageFound in list API: ', herbalimageFound)
      res.status(200).json({
        status: 'ok',
        result: herbalimageFound,
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

//  @route                  GET  /api/v2/herbalimage/:id
//  @desc                   Get herbalimage by Id
//  @access                 Private
router.get('/:id', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get herbalimage by Id API called')
  let id = req.params.id

  try {
    const herbalimageFound = await herbalimage.findOne({
      where: { id },
    })

    if (herbalimageFound) {
      // res.status(200).json(herbalimageFound)
      res.status(200).json({
        status: 'ok',
        result: herbalimageFound,
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

//  @route                  POST  /api/v2/herbalimage
//  @desc                   Post add herbalimage
//  @access                 Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('herbalimage add is called')
  try {
    const form = new formidable.IncomingForm();
    console.log('form.parse(req)',form.parse(req))

    form.parse(req, async (error, fields, files) => {
      let result = await herbalimage.create(fields);
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
