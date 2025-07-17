const express = require('express')
const router = express.Router()

//  @route                  GET  /api/v2/entretype/list
//  @desc                   list all entretypes
//  @access                 Private
router.get('/fe/data', async (req, res) => {
  console.log('get entretype list API called')
  try {

    let dashboard = {
      user : '12',
      log : '13',
    }

    if (dashboard) {
      res.status(200).json({
        status: 'ok',
        result: dashboard,
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

module.exports = router
