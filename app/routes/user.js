const express = require('express')
const router = express.Router()
const user = require('../../models/user')
const role = require('../../models/role')
const userrole = require('../../models/userrole')
const bcrypt = require('bcryptjs')
const constants = require('../../config/constant')
const JWT = require('jsonwebtoken')
const JwtConfig = require('../../config/Jwt-Config')
const JwtMiddleware = require('../../config/Jwt-Middleware')
const formidable = require('formidable')

//  @route                  GET  /api/v2/user/list
//  @desc                   list all users
//  @access                 Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get user list API called')
  try {
    const userFound = await user.findAll({
      attributes: { exclude: ['password'] },
      order: [['id', 'ASC']],
      include: [
        {
          model: role,
        },
      ],
    })
    if (userFound) {
      console.log('userFound in list API: ', userFound)
      res.status(200).json({
        status: 'ok',
        result: userFound,
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

//  @route                  GET  /api/v2/user/info
//  @desc                   Get user info
//  @access                 Private
router.get('/info', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get user info list API called')
  let all_user = await user.count()
  let active_user = await user.count({ where: { status: true } })
  let inactive_user = await user.count({ where: { status: false } })

  setTimeout(() => {
    res.json({
      all_user,
      active_user,
      inactive_user,
    })
  }, 100)
})

//  @route                  POST  /api/v2/user/login
//  @desc                   User login
//  @access                 Public
router.post('/login', async (req, res) => {
  const { username, password } = req.body
  console.log('user login is called')

  let userFound = await user.findOne({ 
    where: { username: username },
    include : {
      model: role,
      through: {
        attributes: []
      }
    } 
  })
  if (userFound != null) {
    // user found
    // console.log('userFound not null',userFound)

    if (bcrypt.compareSync(password, userFound.password)) {

      // console.log('user compared')
      // password match
      // Generate user token

      const roleArr = await userFound.roles.map((item) => {
        return item.code
      })
      
      // if (roleArr) {
      //   console.log('roleArr',roleArr)
      // }

      let userToken = JWT.sign(
        {
          id: userFound.id,
          username: userFound.username,
          roles: roleArr,
          status: userFound.status,
        },
        JwtConfig.secret,
        {
          expiresIn: JwtConfig.expiresIn,
          notBefore: JwtConfig.notBefore,
        },
      )

      res.status(200).json({
        result: constants.kResultOk,
        // roles: [5150],
        // roles: roleArr,
        accessToken: userToken,
      })
    } else {
      res.json({
        userFound: constants.kResultNok,
        message: 'Incorrect password',
      })
    }
  } else {
    res.json({ userFound: constants.kResultNok, message: 'Incorrect username' })
  }
})

//  @route                  POST  /api/v2/user/
//  @desc                   Add user use formidable on reactjs userCreate
//  @access                 Private

router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('user add is called')
  try {
    const form = new formidable.IncomingForm()
    form.parse(req, async (error, fields, files) => {

      fields.password = bcrypt.hashSync(fields.password, 8)

      const { roles , ...rest} =  fields

      if (fields) {
        console.log('farmer fields',fields)
      }  

            
      let userFound = await user.findOne({
        where: { username: fields.username },
      })


      if (userFound) {
        // duplicated user
        res.json({
          result: constants.kResultNok,
          Error: 'Duplicated user',
        })
      } else {

        const rolesArr = JSON.parse(roles)        

        // Create user
        let result = await user.create(fields)

        // create userrole
        if (result.id && rolesArr) {

          const newObject = await rolesArr.map((item) => {
            let temp
            // console.log('roles item', item)
            if (item.roleId !== 0 && item.roleId !== '') {
            temp = {...{userId: result.id}, ...item}
            console.log('temp ready', temp)
            } 
            return temp
           })
           
           Promise.all(newObject).then((data) => {
            console.log('promised data',data)
            // wait for farmerId and than write with herbal relationship to farmerherbal model
            data.map(async (item) => {
              let result
              if (item?.userId && item?.roleId) {
                result = await userrole.create(item)
              }
              // console.log('farmerherbal result',result)
              return result
            })
           })

          // let userroleSuccess = await userrole.create({
          //   userId: result.id,
          //   roleId: roleId
          // })

          console.log('User created ok and result',result)
          res.json({
            result: constants.kResultOk,
            message: 'User created',
          })

        } else {
          res.json({
            result: 'can not add user',
            Error: error,
          })
        }


      }
    })
  } catch (error) {
    res.json({
      result: constants.kResultNok,
      message: JSON.stringify(error),
    })
  }
})

//  @route                  PUT  /api/v2/user/
//  @desc                   Update User use formidable on reactjs userCreate
//  @access                 Private
router.put('/', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const form = new formidable.IncomingForm()
    form.parse(req, async (error, fields, files) => {

      if (fields.password) {
        console.log('Password not empty need to be crypted')
        fields.password = bcrypt.hashSync(fields.password, 8)
      }

      const { roles, id, ...rest } = fields

      let rolesArr


      if (roles) {
        rolesArr = JSON.parse(roles)
        console.log('rolesArr', rolesArr)
      }


      let status = fields.status
      // var roleId = fields.roleId

      // console.log('Formidable Update fields: ', fields)
      // console.log('Formidable Update Error: ', error)

      let result = await user.update(rest,{ where: { id: id } })
      // return from is just 0 and 1 with fail or success only

      const userroleFound = await userrole.findAll({where : { userId : id}})
      
      if ((userroleFound.length > 0)  && (rolesArr.length > 0) && result) {
        console.log('userroleFound: ', userroleFound.map((item)=>[item.dataValues]))

        // update on existing roleId id when changed dropdown 
        await userroleFound.map(async (found) => {
          rolesArr.map(async (item) => {
        console.log('out userrole item', item)
        if (item?.userrole?.roleId && (found.userId == item?.userrole?.userId)) {
          console.log('in userrole item', item)
          await userrole.update({
            roleId : item.id,
            userId : id,
            date : Date.now(),
          },{where: {id : item.userrole.id}})
       } 
        // return item
       })
      })    

          //case add new relation farmer new to farmergroups (insert new row)
        await rolesArr.map(async (item) => {
          console.log('userrole rolesArr item',item)
          if (item?.roleId == 0 && item?.id ) {
          await userrole.create({
            roleId : item.id,
            userId : id,
            date : Date.now(),
          })      
          }
        })

        //case remove roles (who absense? delete!!)
        const arrA1 =  rolesArr.map(async (item) => [item.id])
        console.log('arrA1',arrA1)
        const arrA2 =  userroleFound.map(async (item) => [item.roleId])
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
          console.log('you delete ',toDelete);    
          await userroleFound.map(async(item) => {
            toDelete.map((del) => {
              if (item?.roleId === del) {
                const delSuccess = userrole.destroy({where : {  id: item.id}})
                if (delSuccess) console.log(`del role ${item.id} success`,delSuccess)
                // console.log(`deleted userrole id ${item.id} with role id ${del}` )
                }
            })
          })
        }

    return  


  } else if (rolesArr && result) {
    // new userrole on blank database (found array length <= 0)
    console.log('outside last exit userrole')
    await rolesArr.map(async (item) => {
        console.log('inside last exit userrole',item)
        console.log('inside last exit userrole id',id)
        if (item?.roleId === 0 && item?.id && id ) {
          await userrole.create({
            roleId : item.id,
            userId : id,
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


    })
  } catch (error) {
    res.json({
      result: constants.kResultNok,
      message: JSON.stringify(error),
    })
  }
})

//  @route                  GET  /api/v2/user/:id
//  @desc                   Get user by Id
//  @access                 Private
router.get('/:id', JwtMiddleware.checkToken, async (req, res) => {
  let id = req.params.id

  try {
    const userFound = await user.findOne({
      attributes: { exclude: ['password'] },
      where: { id },
      include: [
        {
          model: role,
          through: {
            attributes: []
          }
        },
      ],      
    })

    if (userFound) {
      // res.status(200).json(userFound)
      res.status(200).json({
        id: userFound.id,
        username: userFound.username,
        // password: '',
        // password2: '',
        firstname: userFound.firstname,
        lastname: userFound.lastname,
        status: userFound.status,
        roles: userFound.roles,
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

//  @route                  DELETE  /api/v2/user/:id
//  @desc                   Delete user by id
//  @access                 Private
router.delete('/:id', JwtMiddleware.checkToken, async (req, res) => {
  try {
    const userFound = await user.findOne({ where: { id: req.params.id } })
    if (userFound) {
      // User found
      const userDeleted = await user.destroy({
        where: {
          id: req.params.id,
        },
      })

      if (userDeleted) {
        // user deleted
        console.log(`User id: ${req.params.id} deleted`)
        res.status(200).json({
          result: constants.kResultOk,
          message: `User id: ${req.params.id} deleted`,
        })
      } else {
        // user delete failed
        console.log(`User id: ${req.params.id} delete failed`)
        res.status(500).json({
          result: constants.kResultNok,
          message: `User id: ${req.params.id} delete failed`,
        })
      }
    } else {
      // user not found
      res.status(500).json({
        result: constants.kResultNok,
        message: 'User not found',
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
