const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const researchinnovation = require('../models/researchinnovation')
const constants = require('../config/constant')
const Sequelize = require('sequelize')
const JwtMiddleware = require('../config/Jwt-Middleware')
const paginate = require('../utils/pagination')
const Op = Sequelize.Op

//  @route                  GET  /api/v2/researchinnovation/list
//  @desc                   list all researchinnovations
//  @access                 public
router.get('/list',async (req, res) => {
  console.log('get researchinnovation API called')
  try {
    const researchinnovationFound = await researchinnovation.findAll({
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
    
    if (researchinnovationFound) {
      console.log('researchinnovationFound in list API: ', researchinnovationFound)
      res.status(200).json({
        status: 'ok',
        result: researchinnovationFound,
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

//  @route                  GET  /api/v2/researchinnovation/list
//  @desc                   list all researchinnovations
//  @access                 public
router.get('/province/:searchText',async (req, res) => {
  console.log('get researchinnovation API called')
  let SearchText = req.params.searchText
  try {
    const researchinnovationFound = await researchinnovation.findAll({
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
    if (researchinnovationFound) {
      console.log('researchinnovationFound in list API: ', researchinnovationFound)
      res.status(200).json({
        status: 'ok',
        result: researchinnovationFound,
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

//  @route                  GET  /api/v2/researchinnovation/select/:id
//  @desc                   Get researchinnovation by Id
//  @access                 Private
router.get('/select/:id', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get researchinnovation by Id API called')
  let id = req.params.id

  try {
    const researchinnovationFound = await researchinnovation.findOne({
      where: { id }    
    })

    if (researchinnovationFound) {
      res.status(200).json({
        status: 'ok',
        result: researchinnovationFound,
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


//  @route                  POST  /api/v2/researchinnovation
//  @desc                   Post add researchinnovation
//  @access                 Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('researchinnovation add is called')
  
  try {
    const form = new formidable.IncomingForm();
    console.log('form.parse(req)',form.parse(req))

    form.parse(req, async (error, fields, files) => {
      let result = await researchinnovation.create(fields);
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

//  @route                  GET  /api/v2/researchinnovation
//  @desc                   list all researchinnovations
//  @access                 public
router.get('/',async (req, res) => {
  console.log('get researchinnovation API called')

  req.query.page = req.query.page || 0;
  req.query.limit = req.query.limit || 5;

  const query = {
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
  }

  try {
    const researchinnovationFound = await researchinnovation.findAndCountAll(paginate(query, { page: req.query.page, pageSize: req.query.limit }))
    if (researchinnovationFound) {
      // console.log('researchinnovationFound in list API: ', researchinnovationFound)
      res.status(200).json({
        status: 'ok',
        page: req.query.page,
        pageSize: req.query.pageSize,
        total: researchinnovationFound.count,
        result: researchinnovationFound.rows,
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

//  @route                  PUT  /api/v2/researchinnovation/
//  @desc                   Update Researchinnovation use formidable on reactjs researchinnovationCreate
//  @access                 Private
router.put('/', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const form = new formidable.IncomingForm()
    form.parse(req, async (error, fields, files) => {

      const { id, ...rest } = fields

      // console.log('Formidable Update fields: ', fields)

      let result = await researchinnovation.update(rest,{ where: { id: id } })

      if (result) {
       res.json({
         result: constants.kResultOk,
         message: JSON.stringify(result)
       });
      } else {
        res.json({
          result: constants.kResultNok,
          message: 'Researchinnovation can not update'
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


//  @route                  DELETE  /api/v2/researchinnovation/:id
//  @desc                   Delete researchinnovation by id
//  @access                 Private
router.delete('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const researchinnovationFound = await researchinnovation.findOne({ where: { id: req.params.id } })
    if (researchinnovationFound) {
      // Researchinnovation found
      const researchinnovationDeleted = await researchinnovation.destroy({
        where: {
          id: req.params.id,
        },
      })

      if (researchinnovationDeleted) {
        // researchinnovation deleted
        console.log(`Researchinnovation id: ${req.params.id} deleted`)
        res.status(200).json({
          result: constants.kResultOk,
          message: `Researchinnovation id: ${req.params.id} deleted`,
        })
      } else {
        // researchinnovation delete failed
        console.log(`Researchinnovation id: ${req.params.id} delete failed`)
        res.status(500).json({
          result: constants.kResultNok,
          message: `Researchinnovation id: ${req.params.id} delete failed`,
        })
      }
    } else {
      // researchinnovation not found
      res.status(500).json({
        result: constants.kResultNok,
        message: 'Researchinnovation not found',
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
