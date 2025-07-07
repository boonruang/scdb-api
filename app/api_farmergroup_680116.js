const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const constants = require('../config/constant')
const farmergroup = require('../models/farmergroup')
const herbal = require('../models/herbal')
const farmergroupherbal = require('../models/farmergroupherbal')
const sequelize = require('../config/db-instance')
const { QueryTypes, where } = require('sequelize');
const emptyPoint = require('../data/mockEmptyPoint.json')
const JwtMiddleware = require('../config/Jwt-Middleware')
const farmer = require('../models/farmer')

//  @route                  POST  /api/v2/farmergroup
//  @desc                   Post add farmergroup
//  @access                 Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('farmergroup add is called')
  try {
    const form = formidable({ multiples: false }); // กำหนดให้รับไฟล์เดียว
    // const form = new formidable.IncomingForm();
    // console.log('form.parse(req)',form.parse(req))
    form.parse(req, async (error, fields, files) => {
      let result = await farmergroup.create(fields);
      // console.log('req files',files)
      const { herbals, ...rest} = fields
      // console.log('req fields',fields)
      // console.log('herbals',herbals)
      console.log('herbals json parse',JSON.parse(herbals))
      // console.log('herbals json justify',JSON.stringify(herbals))
      console.log('req error',error)

      
      const tempArray = JSON.parse(herbals)

      if (result) {
        console.log('created result', result)
        console.log('farmergroupId', result.id)
      }
      if (tempArray && result.id) {
        const newObject = await tempArray.map((item) => {
          // console.log('herbals item', item)
          // item = Object.assign({id: result.id},item) 
          item.area = parseFloat(item.area)
          item.output = parseFloat(item.output)
          let temp = {...{farmergroupId: result.id}, ...item}
          console.log('temp ready', temp)
          return temp
         })
         
         Promise.all(newObject).then((data) => {
          console.log('promised data',data)
          // wait for farmergroupId and than write with herbal relationship to farmergroupherbal model
          data.map(async (item) => {
            const result = await farmergroupherbal.create(item)
            // console.log('farmegroupherbal result',result)
            return result
          })

         })

      } else {
        res.json({
          result: constants.kResultNok,
          message: 'herbals array empty or can not create farmergroupId'       
          })        
      }

        console.log('tempArray', tempArray)

      if (result) {
        res.json({
          result: constants.kResultOk,
          message: JSON.stringify(result)
        });
      } else {
        res.json({
        result: constants.kResultNok,
        message: 'framergroup created fail'       
        })
      }
    });
  } catch (error) {
    res.json({
      result: constants.kResultNok,
      message: JSON.stringify(error)
    });
  }
});


//  @route                  GET  /api/v2/farmergroup/list
//  @desc                   list all farmergroups
//  @access                 Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get farmergroup list API called')
  try {
    const farmergroupFound = await farmergroup.findAll({
      include: [
        {
        model: herbal,
        attributes : ['id','herbalname','commonname','scientificname','othername'] 
       },
       {
        model: farmer,
        attributes : ['id','username','firstname','lastname','cid'] 
       }       
      ], 
       order: [
        ['id','DESC']
      ],    
    })
    if (farmergroupFound) {
      console.log('farmergroupFound in list API: ', farmergroupFound)
      res.status(200).json({
        status: 'ok',
        result: farmergroupFound,
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

//  @route                  GET  /api/v2/farmergroup/list/noauth
//  @desc                   list all farmergroup
//  @access                 public
router.get('/list/noauth', async (req, res) => {
  console.log('get farmergroup no auth list API called')
  try {
    const farmergroupFound = await farmergroup.findAll({
      order: [
        ['id','DESC']
      ],     
    })
    if (farmergroupFound) {
      console.log('farmergroupFound in list API: ', farmergroupFound)
      res.status(200).json({
        status: 'ok',
        result: farmergroupFound,
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

//  @route                  GET  /api/v2/farmergroup/list
//  @desc                   list all farmergroup
//  @access                 Private
router.get('/list/:search', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get farmergroup list API called')
  const locationNull = `(longitude IS NOT NULL AND latitude IS NOT NULL)`
  let searchText = req.params.search
  if (searchText.length > 0 && searchText !== 'all' ) {
   queryStr = `WHERE (farmergroupname LIKE '%${searchText}%' OR facility LIKE '%${searchText}%' OR utility LIKE '%${searchText}%' OR herbal LIKE '%${searchText}%' OR tambon LIKE '%${searchText}%' OR amphoe LIKE '%${searchText}%' OR province LIKE '%${searchText}%')`
   queryStr = queryStr+' AND '+locationNull
  } else if (searchText == 'all') {
    // queryStr = ''
    queryStr = 'WHERE '+locationNull
  }
  try {
        const farmergroupFound = await sequelize.query(`
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
                  'farmergroupname', farmergroupname,
                    'hno', hno,
                    'moo',moo,
                    'village',village,
                    'tambon',tambon,
                    'amphoe',amphoe,
                    'province',province,
                    'postcode',postcode,                
                    'leader',leader,                
                    'cert',cert,                
                    'latitude',latitude,
                    'longitude',longitude,
                    'icon', 'place'
                  )
              )
          )
      )
      FROM farmergroup
      ${queryStr}
      ;
    `, {
        type: QueryTypes.SELECT,
      }); 
      if (farmergroupFound) {
          console.log('farmergroupFound1 in map', farmergroupFound)
          if (farmergroupFound[0]?.json_build_object?.features == null) {
            console.log('features null')
            res.status(200).json({
              status: 'ok',
              result: emptyPoint
            }) 
          } else {
            console.log('farmergroupFound2 in map')
            res.status(200).json({
              status: 'ok',
              result: farmergroupFound[0].json_build_object,
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

//  @route                  GET  /api/v2/farmergroup/list
//  @desc                   list all farmergroups select by Id
//  @access                 Private
router.get('/select/:id', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get farmergroup select by id API called')
  let id = req.params.id
  console.log('id',id)  
  try {
    const farmergroupFound = await farmergroup.findOne({
      where : { id },
      include: {
        model: herbal,
      }
    }); 

      if (farmergroupFound) {
        // console.log('farmergroupFound in map', farmergroupFound)
        console.log('farmergroupFound in map')
        res.status(200).json({
          status: 'ok',
          result: farmergroupFound,
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

//  @route                  DELETE  /api/v2/farmergroup/:id
//  @desc                   Delete farmergroup by id
//  @access                 Private
router.delete('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const farmergroupFound = await farmergroup.findOne({ where: { id: req.params.id } })
    if (farmergroupFound) {
      // farmergroup found
      const farmergroupDeleted = await farmergroup.destroy({
        where: {
          id: req.params.id,
        },
      })

      if (farmergroupDeleted) {
        // farmergroup deleted
        console.log(`farmergroup id: ${req.params.id} deleted`)
        res.status(200).json({
          result: constants.kResultOk,
          message: `farmergroup id: ${req.params.id} deleted`,
        })
      } else {
        // farmergroup delete failed
        console.log(`farmergroup id: ${req.params.id} delete failed`)
        res.status(500).json({
          result: constants.kResultNok,
          message: `farmergroup id: ${req.params.id} delete failed`,
        })
      }
    } else {
      // farmergroup not found
      res.status(500).json({
        result: constants.kResultNok,
        message: 'farmergroup not found',
      })
    }
  } catch (error) {
    res.status(500).json({
      result: constants.kResultNok,
      Error: error.toString(),
    })
  }
})

//  @route                  PUT  /api/v2/farmergroup
//  @desc                   Update farmergroup
//  @access                 Private
router.put('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('farmergroup update is called')
  try {
    const form = formidable({ multiples: false }); // กำหนดให้รับไฟล์เดียว
    // const form = new formidable.IncomingForm();
    // console.log('form.parse(req)',form.parse(req))
    form.parse(req, async (error, fields, files) => {
      
      // console.log('req files',files)
      const { herbals,id, ...rest} = fields
      // console.log('req fields',fields)
      console.log('rest',rest)
      // console.log('herbals',herbals)
      // console.log('herbals json parse',JSON.parse(herbals))
      // console.log('herbals json justify',JSON.stringify(herbals))
      console.log('req error',error)

      const tempArray = JSON.parse(herbals)

      let result = await farmergroup.update(rest, {where : {id}});

      if (result) {
        console.log('updated result', result)
      }

      const farmergroupherbalFound = await farmergroupherbal.findAll({where : { farmergroupId : id}})

      // add and update case

      if ((farmergroupherbalFound.length > 0) && tempArray && result) {
        console.log('inside farmergroupherbalFound 1 ',farmergroupherbalFound)
        
      const newObject = await farmergroupherbalFound.map(async (found) => {
            tempArray.map(async (item) => {
          // console.log('herbals item', item)
          // if (item?.id === item?.farmergroupherbals.herbalId) {
          if (item?.farmergroupherbals.herbalId === found?.herbalId) {
            await farmergroupherbal.update({
              herbalId : item.farmergroupherbals.herbalId,
              area : parseFloat(item.farmergroupherbals.area),
              output : parseFloat(item.farmergroupherbals.output),
            },{where: {id : item.farmergroupherbals.id}})
         } 
          // return item
         })
        })

        //who absense? die!!
        
       
        console.log('fat farmergroupherbalFound',farmergroupherbalFound.flat());
        console.log('fat tempArray',tempArray.flat());

      

    } else if (tempArray && result) {
      console.log('outside farmergroupherbalFound')
        const newObject = await tempArray.map(async (item) => {
          // console.log('herbals item', item)
          if (item?.id === item?.farmergroupherbals.herbalId) {
            await farmergroupherbal.update({
              herbalId : item.farmergroupherbals.herbalId,
              area : parseFloat(item.farmergroupherbals.area),
              output : parseFloat(item.farmergroupherbals.output),
            },{where: {id : item.farmergroupherbals.id}})
          }
          if (item.herbalId === 0) {
            await farmergroupherbal.create({
              farmergroupId : id,
              herbalId : item.farmergroupherbals.herbalId,  
              area : parseFloat(item.farmergroupherbals.area),
              output : parseFloat(item.farmergroupherbals.output),
            })
          }

          return item
         })
    }    // end farmergroupherbalFound


  }); // end parse

  } catch (error) {
    res.json({
      result: constants.kResultNok,
      message: JSON.stringify(error)
    });
  }
});

module.exports = router
