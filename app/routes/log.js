const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const log = require('../../models/log')
const constants = require('../../config/constant')
const Sequelize = require('sequelize')
const JwtMiddleware = require('../../config/Jwt-Middleware')
const Op = Sequelize.Op

//  @route                  GET  /api/v2/log/list
//  @desc                   list all logs
//  @access                 Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get log API called')
  try {
    const logFound = await log.findAll({
      order: [
        ['id','DESC']
      ],
    })
    if (logFound) {
      console.log('logFound in list API: ', logFound)
      res.status(200).json({
        status: 'ok',
        result: logFound,
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

//  @route                  GET  /api/v2/log/select/:id
//  @desc                   Get log by Id
//  @access                 Private
router.get('/select/:id', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get log by Id API called')
  let id = req.params.id

  try {
    const logFound = await log.findOne({
      where: { id }    
    })

    if (logFound) {
      res.status(200).json({
        status: 'ok',
        result: logFound,
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


//  @route                  POST  /api/v2/log
//  @desc                   Post add log
//  @access                 Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('log add is called')
  
  try {
    const form = new formidable.IncomingForm();
    console.log('form.parse(req)',form.parse(req))

    form.parse(req, async (error, fields, files) => {
      let result = await log.create(fields);
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
