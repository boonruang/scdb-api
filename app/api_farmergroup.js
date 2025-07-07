const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const constants = require('../config/constant')
const farmergroup = require('../models/farmergroup')
const farmergroupherbal = require('../models/farmergroupherbal')
const farmergroupfarmer = require('../models/farmergroupfarmer')
const herbal = require('../models/herbal')
const farmer = require('../models/farmer')
const sequelize = require('../config/db-instance')
const { QueryTypes, where } = require('sequelize');
const emptyPoint = require('../data/mockEmptyPoint.json')
const JwtMiddleware = require('../config/Jwt-Middleware')
const Sequelize = require('sequelize')
const Op = Sequelize.Op

const farmersCreate = async (objArr, result) => {
  if (objArr && result.id) {
    const newObject = await objArr.map((item) => {
      let temp
      // console.log('farmers item', item)
      // item = Object.assign({id: result.id},item) 
      if (item.farmerId !== 0 && item.farmerId !== '') {
      temp = {...{farmergroupId: result.id}, ...item}
      console.log('temp ready', temp)
      } 
      return temp
     })
     
     Promise.all(newObject).then((data) => {
      console.log('promised data',data)
      // wait for farmergroupId and than write with herbal relationship to farmergroupfarmer model
      data.map(async (item) => {
        let result
        if (item?.farmergroupId && item?.farmerId) {
          result = await farmergroupfarmer.create(item)
        }
        // console.log('farmergroupfarmer result',result)
        return result
      })
     })

  } else {
    res.json({
      result: constants.kResultNok,
      message: 'herbals array empty or can not create farmergroupId'       
      })        
  }
}

const farmersUpdate = async (farmergroupfarmerFound, objArr, result, id) => {
  if ((farmergroupfarmerFound.length > 0) && objArr && result) {
    // console.log('inside farmergroupfarmerFound 1 ',farmergroupfarmerFound)
    
    // update on existing farmers id by just update area and output
    await farmergroupfarmerFound.map(async (found) => {
        objArr.map(async (item) => {
      // console.log('farmers item', item)
      if (item?.farmergroupfarmers?.farmerId && (found.farmerId === item?.farmergroupfarmers?.farmerId)) {
        await farmergroupfarmer.update({
          farmergroupId : found.farmergroupId,
          farmerId : item.farmergroupfarmers.farmerId,
          date : Date.now(),
        },{where: {id : item.farmergroupfarmers.id}})
     } 
      // return item
     })
    })

    //case add new farmers (insert new row)
    await objArr.map(async (item) => {
      if (item.farmerId === 0 && item?.farmergroupfarmers?.farmerId) {
      await farmergroupfarmer.create({
        farmergroupId : id,
        farmerId : item.farmergroupfarmers.farmerId,
        date : Date.now(),
      })      
      }
    })

    //case remove farmers (who absense? die!!)
    const arrA1 =  objArr.map(async (item) => [item.id])
    console.log('arrA1',arrA1)
    const arrA2 =  farmergroupfarmerFound.map(async (item) => [item.farmerId])
    console.log('arrA2',arrA2)

    const resolvedA1 = await Promise.all(arrA1);
    const resolvedA2 = await Promise.all(arrA2);

if ((resolvedA1.length > 0)  && (resolvedA2.length > 0)) {
      const idsA1 = resolvedA1.map(item => item[0]);
      console.log('id arrA1',idsA1)
      const idsA2 = resolvedA2.map(item => item[0]);
      console.log('id arrA2',idsA2)
      const notInA1 = resolvedA2.filter(item => !idsA1.includes(item[0]));
      // console.log("Not in A1:", notInA1);
      const toDelete = notInA1.map(item => item[0]);
      console.log('id to delete',toDelete);    
      await farmergroupfarmerFound.map(async(item) => {
        toDelete.map((del) => {
          if (item.farmerId === del) {
            farmergroupfarmer.destroy({where : {  id: item.id}})
            console.log(`deleted farmergroupfarmer id ${item.id} with farmer id ${del}` )
            }
        })
      })
    }

return 


// else case (< 0) is a case of farmergroup never add farmer
} else if (objArr && result) {
  console.log('outside farmergroupfarmerFound')
    await objArr.map(async (item) => {
      if (item?.farmergroupfarmers) {
        await farmergroupfarmer.create({
          farmergroupId : id,
          farmerId : item.farmergroupfarmers.farmerId,  
          area : parseFloat(item.farmergroupfarmers.area),
          output : parseFloat(item.farmergroupfarmers.output),
        })
      }
      return item
     })
  }    // end farmergroupfarmerFound  
}

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
      const { herbals, farmers, ...rest} = fields
      // console.log('req fields',fields)
      // console.log('herbals',herbals)
      console.log('herbals json parse',JSON.parse(herbals))
      console.log('farmers json parse',JSON.parse(farmers))
      // console.log('herbals json justify',JSON.stringify(herbals))
      console.log('req error',error)

      
      const herbalsArr = JSON.parse(herbals)
      const farmersArr = JSON.parse(farmers)

            
      if (result) {
        console.log('created result', result)
        console.log('farmergroupId', result.id)
      }
      
      const farmerResult = await farmersCreate(farmersArr, result)

      if (farmerResult) {
        console.log('famer relation with group created', farmerResult)
      }

      if (herbalsArr && result.id) {
        const newObject = await herbalsArr.map((item) => {
          let temp
          // console.log('herbals item', item)
          // item = Object.assign({id: result.id},item) 
          if (item.herbalId !== 0 && item.herbalId !== '') {
          item.area = parseFloat(item.area)
          item.output = parseFloat(item.output)
          temp = {...{farmergroupId: result.id}, ...item}
          console.log('temp ready', temp)
          } 
          return temp
         })
         
         Promise.all(newObject).then((data) => {
          console.log('promised data',data)
          // wait for farmergroupId and than write with herbal relationship to farmergroupherbal model
          data.map(async (item) => {
            let result
            if (item?.farmergroupId && item?.herbalId) {
              result = await farmergroupherbal.create(item)
            }
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

//  @route                  GET  /api/v2/farmergroup/shortlist
//  @desc                   list id,name farmergroups
//  @access                 Private
router.get('/shortlist', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get farmergroup shortlist API called')
  try {
    const farmergroupFound = await farmergroup.findAll({
      where: {
        status: { 
           [Op.eq] :  true
          } 
      },
        attributes : ['id', 'farmergroupname'], 
        order: [
          ['id','ASC']
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
// router.get('/list/noauth', async (req, res) => {
//   console.log('get farmergroup no auth list API called')
//   try {
//     const farmergroupFound = await farmergroup.findAll({
//       order: [
//         ['id','DESC']
//       ],     
//     })
//     if (farmergroupFound) {
//       console.log('farmergroupFound in list API: ', farmergroupFound)
//       res.status(200).json({
//         status: 'ok',
//         result: farmergroupFound,
//       })
//     } else {
//       res.status(500).json({
//         status: 'nok',
//       })
//     }
//   } catch (error) {
//     res.status(500).json({
//       Error: error.toString(),
//     })
//   }
// })

//  @route                  GET  /api/v2/farmergroup/list
//  @desc                   list all farmergroup
//  @access                 Private
router.get('/list/:search', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get farmergroup list API called')
    // เพิ่มการตรวจสอบค่าพิกัดว่าต้องเป็นตัวเลขจริงและ finite
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
  // const locationNull = `(longitude IS NOT NULL AND latitude IS NOT NULL)`

  let searchText = req.params.search
  if (searchText.length > 0 && searchText !== 'all' ) {
    queryStr = `
      WHERE (
        farmergroupname LIKE '%${searchText}%' OR
        facility LIKE '%${searchText}%' OR
        utility LIKE '%${searchText}%' OR
        village LIKE '%${searchText}%' OR
        tambon LIKE '%${searchText}%' OR
        amphoe LIKE '%${searchText}%' OR
        province LIKE '%${searchText}%'
      )
      AND ${locationValid}
      AND ${provinceFilter}
    `;
  } else if (searchText == 'all') {
    // queryStr = ''
    queryStr = `WHERE ${locationValid} AND ${provinceFilter}`;
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
      const { herbals, farmers, id, ...rest} = fields
      console.log('req fields',fields)
      console.log('rest',rest)
      // console.log('herbals',herbals)
      // console.log('farmers',farmers)
      // console.log('herbals json parse',JSON.parse(herbals))
      console.log('req error',error)

      let herbalsArr
      let farmersArr

      if (herbals) {
        herbalsArr = JSON.parse(herbals)
        console.log('herbalsArr',herbalsArr)
      }
      if (farmers) {
         console.log('farmers available')
        farmersArr = JSON.parse(farmers)
        console.log('farmers json parse',farmersArr)
      }

      // first basic set of data
      let result = await farmergroup.update(rest, {where : {id}});

      const farmergroupherbalFound = await farmergroupherbal.findAll({where : { farmergroupId : id}})
      const farmergroupfarmerFound = await farmergroupfarmer.findAll({where : { farmergroupId : id}})

      // add and update case

      const farmerResult = await farmersUpdate(farmergroupfarmerFound, farmersArr, result, id)

      if (farmerResult) {
        console.log('famerResult', farmerResult)
      }

      if ((farmergroupherbalFound.length > 0) && herbalsArr && result) {
        console.log('inside farmergroupherbalFound 1',farmergroupherbalFound)
        
        // update on existing herbals id by just update area and output
        await farmergroupherbalFound.map(async (found) => {
            herbalsArr.map(async (item) => {
          console.log('herbals item', item)
          if (found.id && item?.farmergroupherbals?.herbalId && item?.farmergroupherbals?.id && (found.id === item?.farmergroupherbals?.id)) {
            await farmergroupherbal.update({
              farmergroupId : item?.farmergroupherbals?.farmergroupId,
              herbalId : item.farmergroupherbals.herbalId,
              area : parseFloat(item.farmergroupherbals.area),
              output : parseFloat(item.farmergroupherbals.output),
            },{where: {id : found.id}})
         } 
          // return item
         })
        })

        //case add new herbals (insert new row)
        await herbalsArr.map(async (item) => {
          if (item.herbalId === 0 && item?.farmergroupherbals?.herbalId) {
          await farmergroupherbal.create({
            farmergroupId : id,
            herbalId : item.farmergroupherbals.herbalId,
            area : item.farmergroupherbals.area,
            output : item.farmergroupherbals.output,
          })      
          }
        })

        //case remove herbals (who absense? die!!)

        const arrA1 =  herbalsArr.map(async (item) => [item.id])
        // console.log('arrA1',arrA1)
        const arrA2 =  farmergroupherbalFound.map(async (item) => [item.herbalId])
        // console.log('arrA2',arrA2)

        const resolvedA1 = await Promise.all(arrA1);
        const resolvedA2 = await Promise.all(arrA2);

    if ((resolvedA1.length > 0)  && (resolvedA2.length > 0)) {
          const idsA1 = resolvedA1.map(item => item[0]);
          console.log('id arrA1',idsA1)
          const idsA2 = resolvedA2.map(item => item[0]);
          console.log('id arrA2',idsA2)
          const notInA1 = resolvedA2.filter(item => !idsA1.includes(item[0]));
          // console.log("Not in A1:", notInA1);
          const toDelete = notInA1.map(item => item[0]);
          console.log('you die ',toDelete);    
          await farmergroupherbalFound.map(async(item) => {
            toDelete.map((del) => {
              if (item.herbalId === del) {
                farmergroupherbal.destroy({where : {  id: item.id}})
                console.log(`deleted farmergroupherbal id ${item.id} with herbal id ${del}` )
                }
            })
          })
        }

    return 


    // else case (< 0) is a case of farmergroup never add herbal
    } else if (herbalsArr && result) {
      console.log('outside farmergroupherbalFound')
        const newObject = await herbalsArr.map(async (item) => {
          if (item?.farmergroupherbals) {
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
