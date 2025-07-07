const express = require('express')
const sequelize = require('../config/db-instance')
const { QueryTypes } = require('sequelize');
const router = express.Router()
const formidable = require('formidable')
const herbalmarketplace = require('../models/herbalmarketplace')
const emptyPoint = require('../data/mockEmptyPoint.json')
const constants = require('../config/constant')
const Sequelize = require('sequelize')
const JwtMiddleware = require('../config/Jwt-Middleware')
const Op = Sequelize.Op

//  @route                  GET  /api/v2/herbalmarketplace/list
//  @desc                   list all herbalmarketplaces
//  @access                 public
router.get('/list',async (req, res) => {
  console.log('get herbalmarketplace API called')
  try {
    const herbalmarketplaceFound = await herbalmarketplace.findAll({
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
    if (herbalmarketplaceFound) {
      console.log('herbalmarketplaceFound in list API: ', herbalmarketplaceFound)
      res.status(200).json({
        status: 'ok',
        result: herbalmarketplaceFound,
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
  console.log('get herbalmarketplace list by keyword API called')
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
        herbals LIKE '%${searchText}%' OR
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
        const markgetplaceFound = await sequelize.query(`
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
                  'herbals', herbals,
                  'latitude',latitude,
                  'longitude',longitude,
                  'icon', 'place'
                  )
              )
          )
      )
      FROM herbalmarketplaces
      ${queryStr}
      ;
    `, {
        type: QueryTypes.SELECT,
      }); 
      if (markgetplaceFound) {
          console.log('markgetplaceFound1 in map', markgetplaceFound)
          if (markgetplaceFound[0]?.json_build_object?.features == null) {
            console.log('features null')
            res.status(200).json({
              status: 'ok',
              result: emptyPoint
            }) 
          } else {
            console.log('markgetplaceFound2 in map')
            res.status(200).json({
              status: 'ok',
              result: markgetplaceFound[0].json_build_object,
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

//  @route                  GET  /api/v2/herbalmarketplace/list
//  @desc                   list all herbalmarketplaces
//  @access                 public
router.get('/province/:searchText',async (req, res) => {
  console.log('get herbalmarketplace API called')
  let SearchText = req.params.searchText
  try {
    const herbalmarketplaceFound = await herbalmarketplace.findAll({
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
    if (herbalmarketplaceFound) {
      console.log('herbalmarketplaceFound in list API: ', herbalmarketplaceFound)
      res.status(200).json({
        status: 'ok',
        result: herbalmarketplaceFound,
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

//  @route                  GET  /api/v2/herbalmarketplace/select/:id
//  @desc                   Get herbalmarketplace by Id
//  @access                 Private
router.get('/select/:id', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get herbalmarketplace by Id API called')
  let id = req.params.id

  try {
    const herbalmarketplaceFound = await herbalmarketplace.findOne({
      where: { id }    
    })

    if (herbalmarketplaceFound) {
      res.status(200).json({
        status: 'ok',
        result: herbalmarketplaceFound,
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


//  @route                  POST  /api/v2/herbalmarketplace
//  @desc                   Post add herbalmarketplace
//  @access                 Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('herbalmarketplace add is called')
  
  try {
    const form = new formidable.IncomingForm();
    console.log('form.parse(req)',form.parse(req))

    form.parse(req, async (error, fields, files) => {
      let result = await herbalmarketplace.create(fields);
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

//  @route                  PUT  /api/v2/marketplace/
//  @desc                   Update Marketplace use formidable on reactjs marketplaceCreate
//  @access                 Private
router.put('/', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const form = new formidable.IncomingForm()
    form.parse(req, async (error, fields, files) => {

      const { id, ...rest } = fields

      // console.log('Formidable Update fields: ', fields)

      let result = await herbalmarketplace.update(rest,{ where: { id: id } })

      if (result) {
       res.json({
         result: constants.kResultOk,
         message: JSON.stringify(result)
       });
      } else {
        res.json({
          result: constants.kResultNok,
          message: 'Marketplace can not update'
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


//  @route                  DELETE  /api/v2/marketplace/:id
//  @desc                   Delete marketplace by id
//  @access                 Private
router.delete('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const marketplaceFound = await herbalmarketplace.findOne({ where: { id: req.params.id } })
    if (marketplaceFound) {
      // Marketplace found
      const marketplaceDeleted = await herbalmarketplace.destroy({
        where: {
          id: req.params.id,
        },
      })

      if (marketplaceDeleted) {
        // marketplace deleted
        console.log(`Marketplace id: ${req.params.id} deleted`)
        res.status(200).json({
          result: constants.kResultOk,
          message: `Marketplace id: ${req.params.id} deleted`,
        })
      } else {
        // marketplace delete failed
        console.log(`Marketplace id: ${req.params.id} delete failed`)
        res.status(500).json({
          result: constants.kResultNok,
          message: `Marketplace id: ${req.params.id} delete failed`,
        })
      }
    } else {
      // marketplace not found
      res.status(500).json({
        result: constants.kResultNok,
        message: 'Marketplace not found',
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
