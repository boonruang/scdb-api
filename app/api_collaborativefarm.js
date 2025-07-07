const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const collaborativefarm = require('../models/collaborativefarm')
const collaborativefarmherbal = require('../models/collaborativefarmherbal')
const collaborativefarmfarmer = require('../models/collaborativefarmfarmer')
const herbal = require('../models/herbal')
const farmer = require('../models/farmer')
const constants = require('../config/constant')
const Sequelize = require('sequelize')
const JwtMiddleware = require('../config/Jwt-Middleware')
const Op = Sequelize.Op
const paginate = require('../utils/pagination')

const farmersCreate = async (objArr, result) => {
  if (objArr && result.id) {
    const newObject = await objArr.map((item) => {
      let temp
      // console.log('farmers item', item)
      // item = Object.assign({id: result.id},item) 
      if (item.farmerId !== 0 && item.farmerId !== '') {
      temp = {...{collaborativefarmId: result.id}, ...item}
      console.log('temp ready', temp)
      } 
      return temp
     })
     
     Promise.all(newObject).then((data) => {
      console.log('promised data',data)
      // wait for collaborativefarmId and than write with herbal relationship to collaborativefarmfarmer model
      data.map(async (item) => {
        let result
        if (item?.collaborativefarmId && item?.farmerId) {
          result = await collaborativefarmfarmer.create(item)
        }
        // console.log('collaborativefarmfarmer result',result)
        return result
      })
     })

  } else {
    res.json({
      result: constants.kResultNok,
      message: 'herbals array empty or can not create collaborativefarmId'       
      })        
  }
}

const farmersUpdate = async (collaborativefarmfarmerFound, objArr, result, id) => {
  if ((collaborativefarmfarmerFound.length > 0) && objArr && result) {
    // console.log('inside collaborativefarmfarmerFound 1 ',collaborativefarmfarmerFound)
    
    // update on existing farmers id by just update area and output
    await collaborativefarmfarmerFound.map(async (found) => {
        objArr.map(async (item) => {
      // console.log('farmers item', item)
      if (item?.collaborativefarmfarmers?.farmerId && (found.farmerId === item?.collaborativefarmfarmers?.farmerId)) {
        await collaborativefarmfarmer.update({
          collaborativefarmId : found.collaborativefarmId,
          farmerId : item.collaborativefarmfarmers.farmerId,
          date : Date.now(),
        },{where: {id : item.collaborativefarmfarmers.id}})
     } 
      // return item
     })
    })

    //case add new farmers (insert new row)
    await objArr.map(async (item) => {
      if (item.farmerId === 0 && item?.collaborativefarmfarmers?.farmerId) {
      await collaborativefarmfarmer.create({
        collaborativefarmId : id,
        farmerId : item.collaborativefarmfarmers.farmerId,
        date : Date.now(),
      })      
      }
    })

    //case remove farmers (who absense? die!!)
    const arrA1 =  objArr.map(async (item) => [item.id])
    console.log('arrA1',arrA1)
    const arrA2 =  collaborativefarmfarmerFound.map(async (item) => [item.farmerId])
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
      await collaborativefarmfarmerFound.map(async(item) => {
        toDelete.map((del) => {
          if (item.farmerId === del) {
            collaborativefarmfarmer.destroy({where : {  id: item.id}})
            console.log(`deleted collaborativefarmfarmer id ${item.id} with farmer id ${del}` )
            }
        })
      })
    }

return 


// else case (< 0) is a case of collaborativefarm never add farmer
} else if (objArr && result) {
  console.log('outside collaborativefarmfarmerFound')
    await objArr.map(async (item) => {
      if (item?.collaborativefarmfarmers) {
        await collaborativefarmfarmer.create({
          collaborativefarmId : id,
          farmerId : item.collaborativefarmfarmers.farmerId,  
          area : parseFloat(item.collaborativefarmfarmers.area),
          output : parseFloat(item.collaborativefarmfarmers.output),
        })
      }
      return item
     })
  }    // end collaborativefarmfarmerFound  
}

//  @route                  POST  /api/v2/collaborativefarm
//  @desc                   Post add collaborativefarm
//  @access                 Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('collaborativefarm add is called')
  try {
    const form = formidable({ multiples: false }); // กำหนดให้รับไฟล์เดียว
    // const form = new formidable.IncomingForm();
    // console.log('form.parse(req)',form.parse(req))
    form.parse(req, async (error, fields, files) => {
      let result = await collaborativefarm.create(fields);
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
        console.log('collaborativefarmId', result.id)
      }
      
      const farmerResult = await farmersCreate(farmersArr, result)

      if (farmerResult) {
        console.log('famerResult', farmerResult)
      }

      if (herbalsArr && result.id) {
        const newObject = await herbalsArr.map((item) => {
          let temp
          // console.log('herbals item', item)
          // item = Object.assign({id: result.id},item) 
          if (item.herbalId !== 0 && item.herbalId !== '') {
          item.area = parseFloat(item.area)
          item.output = parseFloat(item.output)
          temp = {...{collaborativefarmId: result.id}, ...item}
          console.log('temp ready', temp)
          } 
          return temp
         })
         
         Promise.all(newObject).then((data) => {
          console.log('promised data',data)
          // wait for collaborativefarmId and than write with herbal relationship to collaborativefarmherbal model
          data.map(async (item) => {
            let result
            if (item?.collaborativefarmId && item?.herbalId) {
              result = await collaborativefarmherbal.create(item)
            }
            // console.log('farmegroupherbal result',result)
            return result
          })
         })

      } else {
        res.json({
          result: constants.kResultNok,
          message: 'herbals array empty or can not create collaborativefarmId'       
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


//  @route                  GET  /api/v2/collaborativefarm/list
//  @desc                   list all collaborativefarms
//  @access                 public
router.get('/list',async (req, res) => {
  console.log('get collaborativefarm API called')
  try {
    const collaborativefarmFound = await collaborativefarm.findAll({
      where: {
        [Op.and]: [
          {
              status: {[Op.eq] : true }
          }, 
          {        
              province: { [Op.any]: ['ขอนแก่น', 'มหาสารคาม', 'ร้อยเอ็ด', 'กาฬสินธุ์'] }
          },
        ]
      },
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
    if (collaborativefarmFound) {
      console.log('collaborativefarmFound in list API: ', collaborativefarmFound)
      res.status(200).json({
        status: 'ok',
        result: collaborativefarmFound,
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

//  @route                  GET  /api/v2/collaborativefarm/shortlist
//  @desc                   list id,name collaborativefarms
//  @access                 Private
router.get('/shortlist', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get collaborativefarm shortlist API called')
  try {
    const collaborativefarmFound = await collaborativefarm.findAll({
      where: {
        [Op.and]: [
          {
              status: {[Op.eq] : true }
          }, 
          {        
              province: { [Op.any]: ['ขอนแก่น', 'มหาสารคาม', 'ร้อยเอ็ด', 'กาฬสินธุ์'] }
          },
        ]
      },
        attributes : ['id','name'], 
        order: [
          ['id','ASC']
        ],        
    })
    if (collaborativefarmFound) {
      console.log('collaborativefarmFound in list API: ', collaborativefarmFound)
      res.status(200).json({
        status: 'ok',
        result: collaborativefarmFound,
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

//  @route                  GET  /api/v2/collaborativefarm/list
//  @desc                   list all collaborativefarms
//  @access                 public
router.get('/province/:searchText',async (req, res) => {
  console.log('get collaborativefarm API called')
  let SearchText = req.params.searchText
  try {
    const collaborativefarmFound = await collaborativefarm.findAll({
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
    if (collaborativefarmFound) {
      console.log('collaborativefarmFound in list API: ', collaborativefarmFound)
      res.status(200).json({
        status: 'ok',
        result: collaborativefarmFound,
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

//  @route                  GET  /api/v2/collaborativefarm/select/:id
//  @desc                   Get collaborativefarm by Id
//  @access                 Private
router.get('/select/:id', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get collaborativefarm by Id API called')
  let id = req.params.id

  try {
    const collaborativefarmFound = await collaborativefarm.findOne({
      where: { id }    
    })

    if (collaborativefarmFound) {
      res.status(200).json({
        status: 'ok',
        result: collaborativefarmFound,
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


//  @route                  PUT  /api/v2/collaborativefarm
//  @desc                   Update collaborativefarm
//  @access                 Private
router.put('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('collaborativefarm update is called')
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
      }
      if (farmers) {
         console.log('farmers available')
        farmersArr = JSON.parse(farmers)
        console.log('farmers json parse',farmersArr)
      }

      // first basic set of data
      let result = await collaborativefarm.update(rest, {where : {id}});

      const collaborativefarmherbalFound = await collaborativefarmherbal.findAll({where : { collaborativefarmId : id}})
      const collaborativefarmfarmerFound = await collaborativefarmfarmer.findAll({where : { collaborativefarmId : id}})

      // add and update case

      const farmerResult = await farmersUpdate(collaborativefarmfarmerFound, farmersArr, result, id)

      if (farmerResult) {
        console.log('famerResult', farmerResult)
      }

      if ((collaborativefarmherbalFound.length > 0) && herbalsArr && result) {
        // console.log('inside collaborativefarmherbalFound 1 ',collaborativefarmherbalFound)
        
        // update on existing herbals id by just update area and output
        await collaborativefarmherbalFound.map(async (found) => {
            herbalsArr.map(async (item) => {
          // console.log('herbals item', item)
          if (item?.collaborativefarmherbals?.herbalId && item?.collaborativefarmherbals?.id && (found.herbalId === item?.collaborativefarmherbals?.herbalId)) {
            await collaborativefarmherbal.update({
              collaborativefarmId : found.collaborativefarmId,
              herbalId : item.collaborativefarmherbals.herbalId,
              area : parseFloat(item.collaborativefarmherbals.area),
              output : parseFloat(item.collaborativefarmherbals.output),
            },{where: {id : item.collaborativefarmherbals.id}})
         } 
          // return item
         })
        })

        //case add new herbals (insert new row)
        await herbalsArr.map(async (item) => {
          if (item.herbalId === 0 && item?.collaborativefarmherbals?.herbalId) {
          await collaborativefarmherbal.create({
            collaborativefarmId : id,
            herbalId : item.collaborativefarmherbals.herbalId,
            area : item.collaborativefarmherbals.area,
            output : item.collaborativefarmherbals.output,
          })      
          }
        })

        //case remove herbals (who absense? die!!)

        const arrA1 =  herbalsArr.map(async (item) => [item.id])
        // console.log('arrA1',arrA1)
        const arrA2 =  collaborativefarmherbalFound.map(async (item) => [item.herbalId])
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
          await collaborativefarmherbalFound.map(async(item) => {
            toDelete.map((del) => {
              if (item.herbalId === del) {
                collaborativefarmherbal.destroy({where : {  id: item.id}})
                console.log(`deleted collaborativefarmherbal id ${item.id} with herbal id ${del}` )
                }
            })
          })
        }

    return 


    // else case (< 0) is a case of collaborativefarm never add herbal
    } else if (herbalsArr && result) {
      console.log('outside collaborativefarmherbalFound')
        const newObject = await herbalsArr.map(async (item) => {
          if (item?.collaborativefarmherbals) {
            await collaborativefarmherbal.create({
              collaborativefarmId : id,
              herbalId : item.collaborativefarmherbals.herbalId,  
              area : parseFloat(item.collaborativefarmherbals.area),
              output : parseFloat(item.collaborativefarmherbals.output),
            })
          }
          return item
         })
    }    // end collaborativefarmherbalFound


  }); // end parse

  } catch (error) {
    res.json({
      result: constants.kResultNok,
      message: JSON.stringify(error)
    });
  }
});

module.exports = router
