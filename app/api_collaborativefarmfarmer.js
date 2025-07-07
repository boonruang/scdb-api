const express = require('express')
const constants = require('../config/constant')
const formidable = require('formidable')
const router = express.Router()
const collaborativefarmfarmer = require('../models/collaborativefarmfarmer')
const JwtMiddleware = require('../config/Jwt-Middleware')

//  @route                  GET  /api/v2/collaborativefarmfarmer/list
//  @desc                   list all collaborativefarmfarmers
//  @access                 Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get collaborativefarmfarmer list API called')
  try {
    const collaborativefarmfarmerFound = await collaborativefarmfarmer.findAll({
      // include: {
      //    model: farmer,
      //    through: {
      //       model: collaborativefarmfarmer
      //    }
      //   },
    })
    if (collaborativefarmfarmerFound) {
      console.log('collaborativefarmfarmerFound in list API: ', collaborativefarmfarmerFound)
      res.status(200).json({
        status: 'ok',
        result: collaborativefarmfarmerFound,
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

//  @route                  GET  /api/v2/collaborativefarmfarmer/:id
//  @desc                   Get collaborativefarmfarmer by Id
//  @access                 Private
router.get('/:id', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get collaborativefarmfarmer by Id API called')
  let id = req.params.id

  try {
    const collaborativefarmfarmerFound = await collaborativefarmfarmer.findOne({
      where: { id },
    })

    if (collaborativefarmfarmerFound) {
      // res.status(200).json(collaborativefarmfarmerFound)
      res.status(200).json({
        status: 'ok',
        result: collaborativefarmfarmerFound,
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

//  @route                  POST  /api/v2/collaborativefarmfarmer
//  @desc                   Post add collaborativefarmfarmer
//  @access                 Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('collaborativefarmfarmer add is called')
  try {
    const form = new formidable.IncomingForm();
    console.log('form.parse(req)',form.parse(req))

    form.parse(req, async (error, fields, files) => {
      let result = await collaborativefarmfarmer.create(fields);
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
