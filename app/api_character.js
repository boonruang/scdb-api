const express = require('express')
const constants = require('../config/constant')
const formidable = require('formidable')
const router = express.Router()
const character = require('../models/character')
const herbal = require('../models/herbal')
const JwtMiddleware = require('../config/Jwt-Middleware')

//  @route                  GET  /api/v2/character/list
//  @desc                   list all characters
//  @access                 Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get character list API called')
  try {
    const characterFound = await character.findAll({
      // include: {
      //   model: herbal,
      //  },      
    })
    if (characterFound) {
      console.log('characterFound in list API: ', characterFound)
      res.status(200).json({
        status: 'ok',
        result: characterFound,
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

//  @route                  GET  /api/v2/character/list
//  @desc                   list all characters select by Id
//  @access                 Private
router.get('/select/:id', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get character select by id API called')
  let id = req.params.id
  console.log('id',id)  
  try {
    const characterFound = await character.findOne({
      where : { id },
      include: {
        model: herbal,
      }
    }); 

      if (characterFound) {
        // console.log('characterFound in map', characterFound)
        console.log('characterFound in map')
        res.status(200).json({
          status: 'ok',
          result: characterFound,
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

//  @route                  POST  /api/v2/character
//  @desc                   Post add character
//  @access                 Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('character add is called')
  try {
    const form = new formidable.IncomingForm();
    console.log('form.parse(req)',form.parse(req))

    form.parse(req, async (error, fields, files) => {
      let result = await character.create(fields);
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
