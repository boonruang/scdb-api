const JWT = require('jsonwebtoken')
const JwtConfig = require('./Jwt-Config')
const log = require('../models/log')
const moment = require('moment-timezone')

const checkToken = async (req, res, next) => {
  let userToken = await req.headers['authorization']
  let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  let reqUrl = await req.url
  let path = req.originalUrl;
  let thisTime = moment().tz('Asia/Bangkok').format('DD-MM-YYYY HH:mm:ss')
  // console.log('res',res)
  // console.log('req header in Middleware: ', req.headers)

  JWT.verify(userToken, JwtConfig.secret, (error, data) => {
    if (error) {
      // console.log('JWT Error: ', error)
      return res.status(501).json({
        error,
      })
    } else if (data.status != true) {
      // console.log('JWT Error: ', error)
      return res.status(501).json({
        jwtError: 'user inactive',
      })
    } else {
      res.user = data
      // logging user action
      // console.log('\x1b[36m%s\x1b[0m','logging', res.user.username + ' ' + req.method +' '+ path +' '+ res.statusCode +' '+ thisTime )
      log.create({
        user: res.user.username,
        method: req.method,
        path: path,
        return: res.statusCode,
        date: thisTime,
      })
      next()
    }
  })
}

module.exports = {
  checkToken: checkToken,
}
