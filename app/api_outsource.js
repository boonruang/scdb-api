const express = require('express')
const sequelize = require('../config/db-instance')
const { QueryTypes } = require('sequelize');
const router = express.Router()
const formidable = require('formidable')
const outsource = require('../models/outsource')
const constants = require('../config/constant')
const Sequelize = require('sequelize')
const JwtMiddleware = require('../config/Jwt-Middleware')
const emptyPoint = require('../data/mockEmptyPoint.json')
const Op = Sequelize.Op

//  @route                  GET  /api/v2/outsource/list
//  @desc                   list all outsources
//  @access                 public
router.get('/list',async (req, res) => {
  console.log('get outsource API called')
  try {
    const outsourceFound = await outsource.findAll({
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
    if (outsourceFound) {
      console.log('outsourceFound in list API: ', outsourceFound)
      res.status(200).json({
        status: 'ok',
        result: outsourceFound,
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

//  @route                  GET  /api/v2/herbalmarketplace/list
//  @desc                   list all herbalmarketplaces
//  @access                 Private
router.get('/list/:search', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get outsources list by keyword API called')
  const locationValid = `
    (
      latitude IS NOT NULL AND
      longitude IS NOT NULL AND
      latitude::text ~ '^[-+]?[0-9]*\\.?[0-9]+$' AND
      longitude::text ~ '^[-+]?[0-9]*\\.?[0-9]+$'
    )
  `;
  const provinceFilter = `
    province IN ('ร้อยเอ็ด', 'ขอนแก่น', 'กาฬสินธุ์', 'มหาสารคาม')
  `;  

  let searchText = req.params.search
  if (searchText.length > 0 && searchText !== 'all' ) {
    queryStr = `
      WHERE (
        name LIKE '%${searchText}%' OR
        services LIKE '%${searchText}%' OR
        standard LIKE '%${searchText}%' OR
        remark LIKE '%${searchText}%' OR
        tambon LIKE '%${searchText}%' OR
        amphoe LIKE '%${searchText}%' OR
        province LIKE '%${searchText}%'
      )
      AND ${locationValid}
      AND ${provinceFilter}
    `;   
  } else if (searchText == 'all') {
    // queryStr = ''
    queryStr = `WHERE ${locationValid} AND ${provinceFilter}`
  }
  try {
        const outsourceFound = await sequelize.query(`
        SELECT json_build_object(
          'type', 'FeatureCollection',
          'crs',  json_build_object(
              'type',      'name', 
              'properties', json_build_object(
                  'name', 'EPSG:4326'  
              )
          ), 
          'features', json_agg(
              json_build_object(
                  'type',       'Feature',
                  'id',         'id',
                  'geometry',   ST_AsGeoJSON(ST_MakePoint(longitude, latitude))::json,
                  'properties', json_build_object(
                    -- list of fields
                  'Id', id,
                  'name', name,
                  'tambon',tambon,
                  'amphoe',amphoe,
                  'province',province,
                  'postcode',postcode,                
                  'services', services,
                  'standard', standard,
                  'remark', remark,
                  'latitude',latitude,
                  'longitude',longitude,
                  'icon', 'place'
                  )
              )
          )
      )
      FROM outsources 
      ${queryStr}
      ;
    `, {
        type: QueryTypes.SELECT,
      }); 
      if (outsourceFound) {
          console.log('outsourceFound1 in map', outsourceFound)
          if (outsourceFound[0]?.json_build_object?.features == null) {
            console.log('features null')
            res.status(200).json({
              status: 'ok',
              result: emptyPoint
            }) 
          } else {
            console.log('outsourceFound2 in map')
            res.status(200).json({
              status: 'ok',
              result: outsourceFound[0].json_build_object,
            })          
          }
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

//  @route                  GET  /api/v2/outsource/list
//  @desc                   list all outsources
//  @access                 public
router.get('/province/:searchText',async (req, res) => {
  console.log('get outsource API called')
  let SearchText = req.params.searchText
  try {
    const outsourceFound = await outsource.findAll({
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
    if (outsourceFound) {
      console.log('outsourceFound in list API: ', outsourceFound)
      res.status(200).json({
        status: 'ok',
        result: outsourceFound,
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

//  @route                  GET  /api/v2/outsource/select/:id
//  @desc                   Get outsource by Id
//  @access                 Private
router.get('/select/:id', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get outsource by Id API called')
  let id = req.params.id

  try {
    const outsourceFound = await outsource.findOne({
      where: { id }    
    })

    if (outsourceFound) {
      res.status(200).json({
        status: 'ok',
        result: outsourceFound,
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


//  @route                  POST  /api/v2/outsource
//  @desc                   Post add outsource
//  @access                 Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('outsource add is called')
  
  try {
    const form = new formidable.IncomingForm();
    console.log('form.parse(req)',form.parse(req))

    form.parse(req, async (error, fields, files) => {
      let result = await outsource.create(fields);
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

//  @route                  PUT  /api/v2/outsource/
//  @desc                   Update Outsource use formidable on reactjs outsourceCreate
//  @access                 Private
router.put('/', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const form = new formidable.IncomingForm()
    form.parse(req, async (error, fields, files) => {

      const { id, ...rest } = fields

      // console.log('Formidable Update fields: ', fields)

      let result = await outsource.update(rest,{ where: { id: id } })

      if (result) {
       res.json({
         result: constants.kResultOk,
         message: JSON.stringify(result)
       });
      } else {
        res.json({
          result: constants.kResultNok,
          message: 'Outsource can not update'
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


//  @route                  DELETE  /api/v2/outsource/:id
//  @desc                   Delete outsource by id
//  @access                 Private
router.delete('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const outsourceFound = await outsource.findOne({ where: { id: req.params.id } })
    if (outsourceFound) {
      // Outsource found
      const outsourceDeleted = await outsource.destroy({
        where: {
          id: req.params.id,
        },
      })

      if (outsourceDeleted) {
        // outsource deleted
        console.log(`Outsource id: ${req.params.id} deleted`)
        res.status(200).json({
          result: constants.kResultOk,
          message: `Outsource id: ${req.params.id} deleted`,
        })
      } else {
        // outsource delete failed
        console.log(`Outsource id: ${req.params.id} delete failed`)
        res.status(500).json({
          result: constants.kResultNok,
          message: `Outsource id: ${req.params.id} delete failed`,
        })
      }
    } else {
      // outsource not found
      res.status(500).json({
        result: constants.kResultNok,
        message: 'Outsource not found',
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
