const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const knowledgebase = require('../models/knowledgebase')
const constants = require('../config/constant')
const Sequelize = require('sequelize')
const JwtMiddleware = require('../config/Jwt-Middleware')
const Op = Sequelize.Op

//  @route                  GET  /api/v2/knowledgebase/list
//  @desc                   list all knowledgebases
//  @access                 public
router.get('/list',async (req, res) => {
  console.log('get knowledgebase API called')
  try {
    const knowledgebaseFound = await knowledgebase.findAll({
      where: {
        [Op.and]: [
          {
              status: {[Op.eq] : true }
          }, 
        ]
      },
      order: [
        ['id','DESC']
      ],
    })
    if (knowledgebaseFound) {
      console.log('knowledgebaseFound in list API: ', knowledgebaseFound)
      res.status(200).json({
        status: 'ok',
        result: knowledgebaseFound,
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

//  @route                  GET  /api/v2/knowledgebase/list
//  @desc                   list all knowledgebases
//  @access                 public
router.get('/province/:searchText',async (req, res) => {
  console.log('get knowledgebase API called')
  let SearchText = req.params.searchText
  try {
    const knowledgebaseFound = await knowledgebase.findAll({
      where: {
        [Op.and]: [
          {
              status: {[Op.eq] : true }
          }, 
          {        
              province: { [Op.eq]: SearchText }
          },
        ]
      },
      order: [
        ['id','ASC']
      ],
    })
    if (knowledgebaseFound) {
      console.log('knowledgebaseFound in list API: ', knowledgebaseFound)
      res.status(200).json({
        status: 'ok',
        result: knowledgebaseFound,
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

//  @route                  GET  /api/v2/knowledgebase/select/:id
//  @desc                   Get knowledgebase by Id
//  @access                 Private
router.get('/select/:id', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get knowledgebase by Id API called')
  let id = req.params.id

  try {
    const knowledgebaseFound = await knowledgebase.findOne({
      where: { id }    
    })

    if (knowledgebaseFound) {
      res.status(200).json({
        status: 'ok',
        result: knowledgebaseFound,
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


//  @route                  POST  /api/v2/knowledgebase
//  @desc                   Post add knowledgebase
//  @access                 Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('knowledgebase add is called')
  
  try {
    const form = new formidable.IncomingForm();
    console.log('form.parse(req)',form.parse(req))

    form.parse(req, async (error, fields, files) => {
      let result = await knowledgebase.create(fields);
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

//  @route                  PUT  /api/v2/knowledgebase/
//  @desc                   Update Knowledgebase use formidable on reactjs knowledgebaseCreate
//  @access                 Private
router.put('/', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const form = new formidable.IncomingForm()
    form.parse(req, async (error, fields, files) => {

      const { id, ...rest } = fields

      // console.log('Formidable Update fields: ', fields)

      let result = await knowledgebase.update(rest,{ where: { id: id } })

      if (result) {
       res.json({
         result: constants.kResultOk,
         message: JSON.stringify(result)
       });
      } else {
        res.json({
          result: constants.kResultNok,
          message: 'Knowledgebase can not update'
        });
      } 

    })
  } catch (error) {
    res.json({
      result: constants.kResultNok,
      message: JSON.stringify(error),
    })
  }
})


//  @route                  DELETE  /api/v2/knowledgebase/:id
//  @desc                   Delete knowledgebase by id
//  @access                 Private
router.delete('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const knowledgebaseFound = await knowledgebase.findOne({ where: { id: req.params.id } })
    if (knowledgebaseFound) {
      // Knowledgebase found
      const knowledgebaseDeleted = await knowledgebase.destroy({
        where: {
          id: req.params.id,
        },
      })

      if (knowledgebaseDeleted) {
        // knowledgebase deleted
        console.log(`Knowledgebase id: ${req.params.id} deleted`)
        res.status(200).json({
          result: constants.kResultOk,
          message: `Knowledgebase id: ${req.params.id} deleted`,
        })
      } else {
        // knowledgebase delete failed
        console.log(`Knowledgebase id: ${req.params.id} delete failed`)
        res.status(500).json({
          result: constants.kResultNok,
          message: `Knowledgebase id: ${req.params.id} delete failed`,
        })
      }
    } else {
      // knowledgebase not found
      res.status(500).json({
        result: constants.kResultNok,
        message: 'Knowledgebase not found',
      })
    }
  } catch (error) {
    res.status(500).json({
      result: constants.kResultNok,
      Error: error.toString(),
    })
  }
})


module.exports = router
