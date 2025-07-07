const express = require('express')
const sequelize = require('../config/db-instance')
const { QueryTypes } = require('sequelize');
const router = express.Router()
const formidable = require('formidable')
const manufacturer = require('../models/manufacturer')
const constants = require('../config/constant')
const Sequelize = require('sequelize')
const JwtMiddleware = require('../config/Jwt-Middleware')
const emptyPoint = require('../data/mockEmptyPoint.json');
const producetype = require('../models/producetype');
const standardtype = require('../models/standardtype');
const producttype = require('../models/producttype');
const ownertype = require('../models/ownertype');
const Op = Sequelize.Op

//  @route                  GET  /api/v2/manufacturer/list
//  @desc                   list all manufacturers
//  @access                 public
router.get('/list',async (req, res) => {
  console.log('get manufacturer API called')
  try {
    const manufacturerFound = await manufacturer.findAll({
      where: {
        [Op.and]: [
          {
              status: {[Op.eq] : true }
          }, 
        ]
      },
      include: [
        {
          model: ownertype,
        },
        {
          model: producetype,
        },
        {
          model: producttype,
        },
        {
          model: standardtype,
        },
      ],      
      order: [
        ['id','DESC']
      ],
    })
    if (manufacturerFound) {
      console.log('manufacturerFound in list API: ', manufacturerFound)
      res.status(200).json({
        status: 'ok',
        result: manufacturerFound,
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
  console.log('get manufacturers list by keyword API called')
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
        standardno LIKE '%${searchText}%' OR
        registrationno LIKE '%${searchText}%' OR
        mophlicenseno LIKE '%${searchText}%' OR
        herbal LIKE '%${searchText}%' OR
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
        const manufacturerFound = await sequelize.query(`
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
                  'registrationno', registrationno,
                  'tambon',tambon,
                  'amphoe',amphoe,
                  'province',province,
                  'postcode',postcode,                
                  'latitude',latitude,
                  'longitude',longitude,
                  'icon', 'place'
                  )
              )
          )
      )
      FROM manufacturer 
      ${queryStr}
      ;
    `, {
        type: QueryTypes.SELECT,
      }); 
      if (manufacturerFound) {
          console.log('manufacturerFound1 in map', manufacturerFound)
          if (manufacturerFound[0]?.json_build_object?.features == null) {
            console.log('features null')
            res.status(200).json({
              status: 'ok',
              result: emptyPoint
            }) 
          } else {
            console.log('manufacturerFound2 in map')
            res.status(200).json({
              status: 'ok',
              result: manufacturerFound[0].json_build_object,
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

//  @route                  GET  /api/v2/manufacturer/list
//  @desc                   list all manufacturers
//  @access                 public
router.get('/province/:searchText',async (req, res) => {
  console.log('get manufacturer API called')
  let SearchText = req.params.searchText
  try {
    const manufacturerFound = await manufacturer.findAll({
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
    if (manufacturerFound) {
      console.log('manufacturerFound in list API: ', manufacturerFound)
      res.status(200).json({
        status: 'ok',
        result: manufacturerFound,
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

//  @route                  GET  /api/v2/manufacturer/select/:id
//  @desc                   Get manufacturer by Id
//  @access                 Private
router.get('/select/:id', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get manufacturer by Id API called')
  let id = req.params.id

  try {
    const manufacturerFound = await manufacturer.findOne({
      where: { id }    
    })

    if (manufacturerFound) {
      res.status(200).json({
        status: 'ok',
        result: manufacturerFound,
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


//  @route                  POST  /api/v2/manufacturer
//  @desc                   Post add manufacturer
//  @access                 Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('manufacturer add is called')
  
  try {
    const form = new formidable.IncomingForm();
    // console.log('form.parse(req)',form.parse(req))

    form.parse(req, async (error, fields, files) => {
      console.log('req fields',fields)
      let result = await manufacturer.create(fields);
      // result = await uploadImage(files, result);

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

//  @route                  PUT  /api/v2/manufacturer/
//  @desc                   Update Manufacturer use formidable on reactjs manufacturerCreate
//  @access                 Private
router.put('/', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const form = new formidable.IncomingForm()
    form.parse(req, async (error, fields, files) => {

      const { id, ...rest } = fields

      // console.log('Formidable Update fields: ', fields)

      let result = await manufacturer.update(rest,{ where: { id: id } })

      if (result) {
       res.json({
         result: constants.kResultOk,
         message: JSON.stringify(result)
       });
      } else {
        res.json({
          result: constants.kResultNok,
          message: 'Manufacturer can not update'
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


//  @route                  DELETE  /api/v2/manufacturer/:id
//  @desc                   Delete manufacturer by id
//  @access                 Private
router.delete('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const manufacturerFound = await manufacturer.findOne({ where: { id: req.params.id } })
    if (manufacturerFound) {
      // Manufacturer found
      const manufacturerDeleted = await manufacturer.destroy({
        where: {
          id: req.params.id,
        },
      })

      if (manufacturerDeleted) {
        // manufacturer deleted
        console.log(`Manufacturer id: ${req.params.id} deleted`)
        res.status(200).json({
          result: constants.kResultOk,
          message: `Manufacturer id: ${req.params.id} deleted`,
        })
      } else {
        // manufacturer delete failed
        console.log(`Manufacturer id: ${req.params.id} delete failed`)
        res.status(500).json({
          result: constants.kResultNok,
          message: `Manufacturer id: ${req.params.id} delete failed`,
        })
      }
    } else {
      // manufacturer not found
      res.status(500).json({
        result: constants.kResultNok,
        message: 'Manufacturer not found',
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
