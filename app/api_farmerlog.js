const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const farmer = require('../models/farmer')
const farmerlog = require('../models/farmerlog')
const user = require('../models/user')
const constants = require('../config/constant')
const Sequelize = require('sequelize')
const JwtMiddleware = require('../config/Jwt-Middleware')
const Op = Sequelize.Op


//  @route                  POST  /api/v2/farmerlog/add
//  @desc                   Post add farmerlog
//  @access                 Private
router.post('/add', async (req, res) => {
  console.log('farmerlog add is called')
  
  try {
    const form = new formidable.IncomingForm();
    console.log('form.parse(req)',form.parse(req))

    form.parse(req, async (error, fields, files) => {
      let result = await farmerlog.create(fields);
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

//  @route                  GET  /api/v2/farmerlog/list
//  @desc                   Get farmerlog list
//  @access                 Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get farmerlog status API called')

  try {

    const farmerlogFound = await farmerlog.findAll({
        order: [['id', 'ASC']],
        // include: [
        //   {
        //     model: farmer,
        //     through: {
        //         model: farmerlog,
        //     }
        //   },        
        // ],
      })    

    if (farmerlogFound) {
      res.status(200).json({
        status: 'ok',
        result: farmerlogFound,
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

module.exports = router
