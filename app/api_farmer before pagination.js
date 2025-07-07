const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const farmer = require('../models/farmer')
const herbal = require('../models/herbal')
const farmerlog = require('../models/farmerlog')
const constants = require('../config/constant')
const Sequelize = require('sequelize')
const JwtMiddleware = require('../config/Jwt-Middleware')
const bcrypt = require('bcryptjs')
const Op = Sequelize.Op
const farmergroup = require('../models/farmergroup')
const farmergroupfarmer = require('../models/farmergroupfarmer')
const farmerherbal = require('../models/farmerherbal')
const collaborativefarm = require('../models/collaborativefarm')
const collaborativefarmfarmer = require('../models/collaborativefarmfarmer')
const entrepreneurherbal = require('../models/entrepreneurherbal')
const entrepreneurmedical = require('../models/entrepreneurmedical')

const farmergroupfarmerRelationCreate = async (objArr, result) => {
  console.log('farmergroupfarmerRelationCreate is called')
  if (objArr && result.id) {
    const newObject = await objArr.map((item) => {
      console.log('item', item)
      let temp
      // console.log('farmers item', item)
      // item = Object.assign({id: result.id},item) 
      if (item.farmergroupId !== 0 && item.farmergroupId !== '') {
      temp = {...{farmerId: result.id}, ...item}
      console.log('temp ready', temp)
      } 
      return temp
     })
     
     Promise.all(newObject).then((data) => {
      console.log('promised data',data)
      // wait for farmergroupId and than write with herbal relationship to farmergroupfarmer model
      data.map(async (item) => {
        let thisResult
        if (item?.farmergroupId && item?.farmerId) {
          thisResult = await farmergroupfarmer.create(item)
        }
        // console.log('farmergroupfarmer result',result)
        return thisResult
      })
     })

  } else {
    res.json({
      result: constants.kResultNok,
      message: 'herbals array empty or can not create farmergroupId'       
      })        
  }
}

const collaborativefarmRelationCreate = async (objArr, result) => {
  if (objArr && result.id) {
    const newObject = await objArr.map((item) => {
      let temp
      // console.log('farmers item', item)
      // item = Object.assign({id: result.id},item) 
      if (item.collaborativefarmId !== 0 && item.collaborativefarmId !== '') {
      temp = {...{farmerId: result.id}, ...item}
      console.log('temp ready', temp)
      } 
      return temp
     })
     
     Promise.all(newObject).then((data) => {
      console.log('promised data',data)
      // wait for farmergroupId and than write with herbal relationship to farmergroupfarmer model
      data.map(async (item) => {
        let result
        if (item?.collaborativefarmId && item?.farmerId) {
          result = await collaborativefarmfarmer.create(item)
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


const farmergroupfarmerRelationUpdate = async (farmergroupfarmerFound, objArr, result, id) => {
  console.log('inside collaborativefarmfarmerFound farmergroupfarmerRelationUpdate ',farmergroupfarmerFound)
  console.log('inside collaborativefarmfarmerFound objArr ',objArr)
  console.log('inside collaborativefarmfarmerFound result ',result)

  if ((farmergroupfarmerFound.length > 0) && objArr && result) {
    // console.log('inside farmergroupfarmerFound 1 ',farmergroupfarmerFound)
    
    // update on existing farmergroupfarmer
    await farmergroupfarmerFound.map(async (found) => {
        objArr.map(async (item) => {
      // console.log('farmers item', item)
      if ((item?.farmergroupfarmers?.farmergroupId !== item?.id) && (found.farmerId === item?.farmergroupfarmers?.farmerId)) {
        const isDoneUpdate = await farmergroupfarmer.update({
          farmergroupId : item.id,
          farmerId : id,
          date : Date.now(),
        },{where: {id : item.farmergroupfarmers.id}})
        console.log('R u done? item.id',item.id+' id '+id)
        if (isDoneUpdate) {
          console.log('isDoneUpdate',isDoneUpdate)
        }
     } 
      // return item
     })
    })

    //case add new relation farmer new to farmergroups (insert new row)
    await objArr.map(async (item) => {
      console.log('id: ',id+' item.farmergroupId '+item?.farmergroupId+' farmergroupId '+item?.id)
      if (item.farmergroupId === 0 && item?.id) {
      await farmergroupfarmer.create({
        farmergroupId : item.id,
        farmerId : id,
        date : Date.now(),
      })      
      }
    })

    //case remove farmergroups (who absense? die!!)
    const arrA1 =  objArr.map(async (item) => [item.id])
    console.log('farmergroup arrA1',arrA1)
    const arrA2 =  farmergroupfarmerFound.map(async (item) => [item.farmergroupId])
    console.log('farmergroup arrA2',arrA2)

    const resolvedA1 = await Promise.all(arrA1);
    const resolvedA2 = await Promise.all(arrA2);

      if ((resolvedA1.length > 0)  && (resolvedA2.length > 0) && (resolvedA1.length !== resolvedA2.length)) {
            const idsA1 = resolvedA1.map(item => item[0]);
            console.log('id arrA1',idsA1)
            const idsA2 = resolvedA2.map(item => item[0]);
            console.log('id arrA2',idsA2)
            const notInA1 = resolvedA2.filter(item => !idsA1.includes(item[0]));
            // console.log("Not in A1:", notInA1);
            const toDelete = notInA1.map(item => item[0]);
            console.log('farmergroup.id to delete',toDelete);    
            await farmergroupfarmerFound.map(async(item) => {
              toDelete.map((del) => {
                // console.log('Out farmergroup gotta delete ', item.id+' --- '+item?.farmergroupId+' del id '+del+' farmerid '+item?.farmerId+' id '+id)
                if (item?.farmergroupId == del && (item?.farmerId == id)) {
                  // console.log('In farmergroup gotta delete ', item.id+' --- '+item?.farmergroupId+' del id '+del+' farmerid '+item?.farmerId+' id '+id)
                  farmergroupfarmer.destroy({where : {  id: item.id}})
                  console.log(`deleted farmergroupfarmer id ${del} with farmer id ${id}` )
                  }
              })
            })
          }
      return 

  // else case (< 0) is a case of farmergroup never add farmer
  } else if (objArr && result) {
    console.log('outside farmergroupfarmerFound')
    await objArr.map(async (item) => {
        console.log('inside farmergroupfarmerFound', item)
        if (item?.farmergroupfarmers === 0 && item.id && id) {
          await farmergroupfarmer.create({
            farmergroupId : item.id,
            farmerId : id,  
            date : Date.now(),
          })
        }
        return item
      })
    }    // end farmergroupfarmerFound  

}

const collaborativefarmRelationUpdate = async (collaborativefarmfarmerFound, objArr, result, id) => {
  console.log('inside collaborativefarmfarmerFound collaborativefarmfarmerFound ',collaborativefarmfarmerFound)
  console.log('inside collaborativefarmfarmerFound objArr ',objArr)
  console.log('inside collaborativefarmfarmerFound result ',result)
  if ((collaborativefarmfarmerFound.length > 0) && objArr && result) {
    console.log('inside collaborativefarmfarmerFound 1 ',collaborativefarmfarmerFound)
    
    // update on existing farmergroups id by just update area and output
    await collaborativefarmfarmerFound.map(async (found) => {
        objArr.map(async (item) => {
      console.log('out collaborativefarm item', item)
      if (item?.collaborativefarmfarmers?.collaborativefarmId && (found.collaborativefarmId == item?.collaborativefarmfarmers?.collaborativefarmId)) {
        console.log('in collaborativefarm item', item)
        await collaborativefarmfarmer.update({
          collaborativefarmId : item.id,
          farmerId : id,
          date : Date.now(),
        },{where: {id : item.collaborativefarmfarmers.id}})
     } 
      // return item
     })
    })

    //case add new relation farmer new to farmergroups (insert new row)
    await objArr.map(async (item) => {
      console.log('collaborativefarm objArr item',item)
      if (item?.collaborativefarmId == 0 && item?.id ) {
      await collaborativefarmfarmer.create({
        collaborativefarmId : item.id,
        farmerId : id,
        date : Date.now(),
      })      
      }
    })

    //case remove farmergroups (who absense? die!!)
    const arrA1 =  objArr.map(async (item) => [item.id])
    console.log('arrA1',arrA1)
    const arrA2 =  collaborativefarmfarmerFound.map(async (item) => [item.collaborativefarmId])
    console.log('arrA2',arrA2)

    const resolvedA1 = await Promise.all(arrA1);
    const resolvedA2 = await Promise.all(arrA2);

if ((resolvedA1.length > 0)  && (resolvedA2.length > 0) && (resolvedA1.length !== resolvedA2.length)) {
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
          if (item.collaborativefarmId == del && (item?.farmerId == id)) {
            collaborativefarmfarmer.destroy({where : {  id: item.id}})
            console.log(`deleted collaborativefarmfarmer id ${item.id} with farmer id ${del}` )
            }
        })
      })
    }

return 

// else case (< 0) is a case of farmergroup never add farmer
} else if (objArr && result) {
  console.log('outside last exit collaborativefarmfarmer')
  await objArr.map(async (item) => {
      console.log('inside last exit collaborativefarmfarmer',item)
      console.log('inside last exit collaborativefarmfarmer id',id)
      if (item?.collaborativefarmId === 0 &&  item?.id && id ) {
        await collaborativefarmfarmer.create({
          collaborativefarmId : item.id,
          farmerId : id,
          date: Date.now()  
        })
      }
      return item
     })

     // end farmergroupfarmerFound  
  } 
  else {
    console.log('can not update collaborativefarmfarmer')
  } 

}


//  @route                  GET  /api/v2/farmer/list
//  @desc                   list all farmers
//  @access                 Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get farmer API called')
  try {
    const farmerFound = await farmer.findAll({
      where: {
        status: { 
           [Op.eq] :  true
          } 
      },
      attributes: {exclude: ['password']},
      order: [
        ['id','DESC']
      ],
      include : [
        {
          model: herbal,
          // through: {
          //   attributes: []
          // }
        },
        {
          model:  farmergroup,
          // through: {
          //   attributes: []
          // }
        },        
        {
          model:  collaborativefarm,
          // through: {
          //   attributes: []
          // }
        },        
      ],      
    })
    
    if (farmerFound) {
      // console.log('farmerFound in list API: ', farmerFound)

      const newResults =  farmerFound.map(async (result) => {

        if (result?.farmergroupId?.length > 0 && result?.farmergroupId != 'null' && result?.farmergroupId != 'undefined') {
          // console.log('result farmergroupId ', result?.id+' => '+result?.farmergroupId)
          const farmergroupFound = await farmergroup.findOne({
            where: { id : result?.farmergroupId  }    
          })
            // console.log('farmergroupFound ', farmergroupFound?.farmergroupname)
            result.farmergroupId = farmergroupFound?.farmergroupname
        }

        if (result?.collaborativefarmId?.length > 0 && result?.collaborativefarmId != 'null' && result?.collaborativefarmId != 'undefined') {
          // console.log('result collaborativefarmId ', result?.id+' => '+result?.collaborativefarmId)
          const collaborativefarmFound = await collaborativefarm.findOne({
            where: { id : result?.collaborativefarmId  }    
          })
            // console.log('collaborativefarmFound ', collaborativefarmFound?.name)
            result.collaborativefarmId = collaborativefarmFound?.name          
        }

        return result
      })

      return Promise.all(newResults).then((data) => {
        // console.log("data", data);
        res.status(200).json({
          status: 'ok',
          result: data,
        })
      })

      // const farmerFound = await collaborativefarm.findOne({
      //   where: { id  }    
      // })


      // res.status(200).json({
      //   status: 'ok',
      //   result: farmerFound,
      // })


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

//  @route                  GET  /api/v2/farmer/select/:id
//  @desc                   Get farmer by Id
//  @access                 Private
router.get('/select/:id', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get farmer by Id API called')
  let id = req.params.id

  try {
    const farmerFound = await farmer.findOne({
      where: { id },
      attributes: {exclude: ['password']},
      include : [
        {
          model: herbal,
          // through: {
          //   attributes: []
          // }
        },
        {
          model:  farmergroup,
          // through: {
          //   attributes: []
          // }
        },        
        {
          model:  collaborativefarm,
          // through: {
          //   attributes: []
          // }
        },        
      ],     
    })

    if (farmerFound) {
      res.status(200).json({
        status: 'ok',
        result: farmerFound,
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


//  @route                  POST  /api/v2/farmer
//  @desc                   Post add farmer
//  @access                 Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('farmer add is called')
  
  try {
    const form = new formidable.IncomingForm();
    // console.log('form.parse(req)',form.parse(req))

    form.parse(req, async (error, fields, files) => {

      fields.password = bcrypt.hashSync(fields.password, 8)

      const { collaborativefarms, farmergroups, herbals , ...rest} =  fields

      if (fields) {
        console.log('farmer fields',fields)
      }      

      // username is cid 
      let farmerFound = await farmer.findOne({
        where: { username: fields.username },
      })   
      

      if (farmerFound) {
        // duplicated cid
        res.json({
          result: constants.kResultNok,
          Error: 'Duplicated farmer username (cid)',
        })
        console.log('Duplicated farmer usernam with use',farmerFound.username);
      } else {
        // Create farmer

        const herbalsArr = JSON.parse(herbals)
        const farmergroupArr = JSON.parse(farmergroups)
        const collaborativefarmArr = JSON.parse(collaborativefarms)
  
        // if (farmergroupArr) {
        //   console.log('farmergroupArr ',farmergroupArr)
        //   console.log('array length is  ',farmergroupArr.length)
        // }

        if (collaborativefarmArr) {
          console.log('collaborativefarmArr ',collaborativefarmArr)
          console.log('array length is  ',collaborativefarmArr.length)
        }


        let result = await farmer.create(fields);

        if (farmergroupArr.length > 0 && result) {
          console.log('are you at start point')
          const farmergroupResult = await farmergroupfarmerRelationCreate(farmergroupArr, result)
            if (farmergroupResult) {
              console.log('farmergroup relation with farmer created', farmergroupResult)
            }  
          }

          if (collaborativefarmArr.length > 0 && result) {
          const collaborativefarmResult = await collaborativefarmRelationCreate(collaborativefarmArr, result)
            if (collaborativefarmResult) {
              console.log('collaborativefarm relation with farmer created', collaborativefarmResult)
            }   
          }
      

     
        
      if (result.id && herbalsArr) {

        const newObject = await herbalsArr.map((item) => {
          let temp
          // console.log('herbals item', item)
          if (item.herbalId !== 0 && item.herbalId !== '') {
          item.area = parseFloat(item.area)
          item.output = parseFloat(item.output)
          temp = {...{farmerId: result.id}, ...item}
          console.log('temp ready', temp)
          } 
          return temp
         })
         
         Promise.all(newObject).then((data) => {
          console.log('promised data',data)
          // wait for farmerId and than write with herbal relationship to farmerherbal model
          data.map(async (item) => {
            let result
            if (item?.farmerId && item?.herbalId) {
              result = await farmerherbal.create(item)
            }
            // console.log('farmerherbal result',result)
            return result
          })
         })

        console.log('farmer created ok and result',result)
          res.status(200).json({
            status: 'farmer created ok',
            result: result,
          })

        } else {
          res.status(200).json({
            status: 'result not ok',
          })        
        }
      }       
    });
  } catch (error) {
    res.json({
      result: constants.kResultNok,
      message: JSON.stringify(error)
    });
  }
});

//  @route                  DELETE  /api/v2/farmer/:id
//  @desc                   Delete by id
//  @access                 Private
router.delete('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const farmerFound = await farmer.findOne({ where: { id: req.params.id } })
    if (farmerFound) {
      // farmer found
      const farmerDeleted = await farmer.destroy({
        where: {
          id: req.params.id,
        },
      })

      if (farmerDeleted) {
        // farmer deleted
        console.log(`farmer id: ${req.params.id} deleted`)
        res.status(200).json({
          result: constants.kResultOk,
          message: `farmer id: ${req.params.id} deleted`,
        })
      } else {
        // farmer delete failed
        console.log(`farmer id: ${req.params.id} delete failed`)
        res.status(500).json({
          result: constants.kResultNok,
          message: `farmer id: ${req.params.id} delete failed`,
        })
      }
    } else {
      // farmer not found
      res.status(500).json({
        result: constants.kResultNok,
        message: 'farmer not found',
      })
    }
  } catch (error) {
    res.status(500).json({
      result: constants.kResultNok,
      Error: error.toString(),
    })
  }
})

//  @route                  PUT  /api/v2/farmer/
//  @desc                   Update farmer use formidable on reactjs farmerCreate
//  @access                 Private
router.put('/', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const form = new formidable.IncomingForm()
    form.parse(req, async (error, fields, files) => {
      if (fields.password) {
        console.log('Password not empty need to be crypted')
        fields.password = bcrypt.hashSync(fields.password, 8)
      }
      let status = fields.status
      // var roleId = fields.roleId

      const { collaborativefarms, farmergroups, herbals, id, ...rest } = fields

      let herbalsArr
      let farmergroupArr
      let collaborativefarmArr

      if (herbals) {
        herbalsArr = JSON.parse(herbals)
        // console.log('herbalsArr', herbalsArr)
      }

      if (farmergroups) {
         farmergroupArr = JSON.parse(farmergroups)
        //  console.log('farmergroupArr', farmergroupArr)
      }

      if (collaborativefarms) {
        collaborativefarmArr = JSON.parse(collaborativefarms)
        // console.log('collaborativefarmArr', collaborativefarmArr)
      }

      console.log('rest data', rest)
      // console.log('Formidable Update fields: ', fields)
      // console.log('Formidable Update Error: ', error)
      // console.log('fields.id: ', fields.id)

      let result = await farmer.update(rest,{ where: { id: id } })

      const farmerherbalFound = await farmerherbal.findAll({where : { farmerId : id}})
      const farmergroupfarmerFound = await farmergroupfarmer.findAll({where : { farmerId : id}})
      const collaborativefarmfarmerFound = await collaborativefarmfarmer.findAll({where : { farmerId : id}})

      if (farmergroupfarmerFound && farmergroupArr && result) {
        console.log('stemp in farmergroupRelationUpdate')
        const farmergroupResult = await farmergroupfarmerRelationUpdate(farmergroupfarmerFound, farmergroupArr, result, id)
        if (farmergroupResult) {
          console.log('farmer relation with farmergroup updated', farmergroupResult)
        }          
      }

      if (collaborativefarmfarmerFound && collaborativefarmArr && result) {
        console.log('stemp in collaborativefarmRelationUpdate')
      const collaborativefarmfarmerResult = await collaborativefarmRelationUpdate(collaborativefarmfarmerFound, collaborativefarmArr, result, id)
      if (collaborativefarmfarmerResult) {
        console.log('farmer relation with collaborativefarm updated', collaborativefarmfarmerResult)
      }      
      }


      if ((farmerherbalFound.length > 0) && (herbalsArr.length > 0) && result) {
        console.log('inside farmerherbalFound 1 ',farmerherbalFound)
        
        // update on existing herbals id by just update area and output
        await farmerherbalFound.map(async (found) => {
            herbalsArr.map(async (item) => {
          // console.log('herbals item', item)
          if ( found.herbalId && item?.farmerherbals?.id && (found.herbalId === item?.farmerherbals?.herbalId)) {
            await farmerherbal.update({
              farmerId : found.farmerId,
              herbalId : item.farmerherbals.herbalId,
              area : parseFloat(item.farmerherbals.area),
              output : parseFloat(item.farmerherbals.output),
            },{where: {id : item.farmerherbals.id}})
         } 
          // return item
         })
        })      

        //case add new herbals (insert new row)
       await herbalsArr?.map(async (item) => {
          // console.log('id: ',id+' item.herbalId '+item?.herbalId+' farmerherbals.id '+item?.farmerherbals?.id)
          if (item?.herbalId === 0 && item?.farmerherbals?.id) {
          await farmerherbal.create({
            farmerId : id,
            herbalId : item.farmerherbals.id,
            area : item.farmerherbals.area,
            output : item.farmerherbals.output,
          })      
          }
        })     


        //case remove herbals (who absense? die!!)

        const arrA1 =  herbalsArr.map(async (item) => [item.id])
        // console.log('arrA1',arrA1)
        const arrA2 =  farmerherbalFound.map(async (item) => [item.herbalId])
        // console.log('arrA2',arrA2)

        const resolvedA1 = await Promise.all(arrA1);
        const resolvedA2 = await Promise.all(arrA2);

    if ((resolvedA1.length > 0)  && (resolvedA2.length > 0) && (resolvedA1.length !== resolvedA2.length)) {
          const idsA1 = resolvedA1.map(item => item[0]);
          console.log('id arrA1',idsA1)
          const idsA2 = resolvedA2.map(item => item[0]);
          console.log('id arrA2',idsA2)
          const notInA1 = resolvedA2.filter(item => !idsA1.includes(item[0]));
          // console.log("Not in A1:", notInA1);
          const toDelete = notInA1.map(item => item[0]);
          console.log('you die ',toDelete);    
          await farmerherbalFound.map(async(item) => {
            toDelete.map((del) => {
              if (item.herbalId === del) {
                farmerherbal.destroy({where : {  id: item.id}})
                console.log(`deleted farmerherbal id ${item.id} with herbal id ${del}` )
                }
            })
          })
        }

    return         


      } else if (herbalsArr && result) {
        console.log('outside farmerherbalFound')
          const newObject = await herbalsArr.map(async (item) => {
            if (item?.farmerherbals) {
              await farmerherbal.create({
                farmerId : id,
                herbalId : item.farmerherbals.herbalId,  
                area : parseFloat(item.farmerherbals.area),
                output : parseFloat(item.farmerherbals.output),
              })
            }
            return item
           })
      }    // end farmerherbalFound


    })
  } catch (error) {
    res.json({
      result: constants.kResultNok,
      message: JSON.stringify(error),
    })
  }
})

module.exports = router
