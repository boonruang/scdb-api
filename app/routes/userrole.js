const express = require('express')
const constants = require('../../config/constant')
const formidable = require('formidable')
const router = express.Router()
const role = require('../../models/role')
const userrole = require('../../models/userrole')
const JwtMiddleware = require('../../config/Jwt-Middleware')

//  @route                  GET  /api/v2/userrole/list
//  @desc                   list all userrole
//  @access                 Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get userrole list API called')
  try {
    const userroleFound = await userrole.findAll()
    if (userroleFound) {
      console.log('userroleFound in list API: ', userroleFound)
      res.status(200).json({
        status: 'ok',
        result: userroleFound,
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

//  @route                  GET  /api/v2/userrole/:id
//  @desc                   Get userrole by Id
//  @access                 Private
router.get('/:id', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get userrole by Id API called')
  let id = req.params.id

  try {
    const userroleFound = await userrole.findOne({
      where: { id },
    })

    if (userroleFound) {
      // res.status(200).json(userroleFound)
      res.status(200).json({
        status: 'ok',
        result: userroleFound,
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

//  @route                  POST  /api/v2/userrole
//  @desc                   Post add userrole
//  @access                 Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('userrole add is called')
  try {
    const form = new formidable.IncomingForm();
    console.log('form.parse(req)',form.parse(req))

    form.parse(req, async (error, fields, files) => {
      let result = await userrole.create(fields);
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

module.exports = router
