const express = require('express')
const router = express.Router()
// const user = require('../../models/user')
// const bcrypt = require('bcryptjs')
// const constants = require('../../config/constant')
const user = require('../../models/user')
const bcrypt = require('bcryptjs')
const JWT = require('jsonwebtoken')
const JwtConfig = require('../../config/Jwt-Config')
const constants = require('../../config/constant')
const role = require('../../models/role')
const userrole = require('../../models/userrole')
const JwtMiddleware = require('../../config/Jwt-Middleware')

//  @route                  POST  /api/v2/auth/verify
//  @desc                   User authorization verify & get token
//  @access                 Private
router.post('/verify', JwtMiddleware.checkToken, async (req, res) => {
  let userToken = req.headers['authorization']
  JWT.verify(userToken, JwtConfig.secret, (error, data) => {
    if (error) {
      res.status(500).json({
        error,
      })
    } else {
      res.status(200).json({
        message: 'Authorized',
        user: data.username,
      })
    }
  })
})

//  @route                  POST  /api/v2/auth
//  @desc                   User auth (login)
//  @access                 Public
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  const { username, password } = req.body
  console.log('auth is called user,pass',username, password)

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

      let userToken = JWT.sign(
        {
          id: userFound.id,
          username: userFound.username,
          // roleId: userFound.roleId,
          status: userFound.status,
        },
        JwtConfig.secret,
        {
          expiresIn: JwtConfig.expiresIn,
          notBefore: JwtConfig.notBefore,
        },
      )

      const roleArr = await userFound.roles.map((item) => {
        return item.code
      })

      // if (roleArr) {
      //   console.log('roleArr',roleArr)
      // }

      res.status(200).json({
        result: constants.kResultOk,
        // roles: [5150],
        roles: roleArr,
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

module.exports = router
