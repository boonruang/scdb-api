const express = require('express')
const constants = require('../config/constant')
const formidable = require('formidable')
const router = express.Router()
const farmergroupherbal = require('../models/farmergroupherbal')
const farmergroup = require('../models/farmergroup')
const herbal = require('../models/herbal')
const JwtMiddleware = require('../config/Jwt-Middleware')

//  @route                  GET  /api/v2/farmergroupherbal/list
//  @desc                   list all farmergroupherbals
//  @access                 Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get farmergroupherbal list API called')
  try {
    const farmergroupherbalFound = await farmergroupherbal.findAll({
      // include: {
      //    model: herbal,
      //    through: {
      //       model: farmergroupherbal
      //    }
      //   },
    })
    if (farmergroupherbalFound) {
      console.log('farmergroupherbalFound in list API: ', farmergroupherbalFound)
      res.status(200).json({
        status: 'ok',
        result: farmergroupherbalFound,
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

//  @route                  GET  /api/v2/farmergroupherbal/:id
//  @desc                   Get farmergroupherbal by Id
//  @access                 Private
router.get('/:id', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get farmergroupherbal by Id API called')
  let id = req.params.id

  try {
    const farmergroupherbalFound = await farmergroupherbal.findOne({
      where: { id },
        // include: {
        //  model: herbal,
        //  through: {
        //     model: farmergroupherbal
        //  }
        // },
    })

    if (farmergroupherbalFound) {
      // res.status(200).json(farmergroupherbalFound)
      res.status(200).json({
        status: 'ok',
        result: farmergroupherbalFound,
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

//  @route                  POST  /api/v2/farmergroupherbal
//  @desc                   Post add farmergroupherbal
//  @access                 Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('farmergroupherbal add is called')
  try {
    const form = new formidable.IncomingForm();
    console.log('form.parse(req)',form.parse(req))

    form.parse(req, async (error, fields, files) => {
      let result = await farmergroupherbal.create(fields);
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


// WAITING FOR DELETE!!!! 68/01/14 2:57PM use farmergoup instead.

// //  @route                  GET  /api/v2/farmergroupherbal/farmergroup/:id
// //  @desc                   Get farmergroupherbal by farmergoroupId
// //  @access                 Private
// router.get('/farmergroupid/:id', JwtMiddleware.checkToken, async (req, res) => {
//   console.log('get farmergroupherbal by farmergoroupId API called')
//   let id = req.params.id

//   try {
//     const farmergroupherbalFound = await farmergroupherbal.findAll({
//       where: { farmergroupId : id },

//     })
//       // console.log('farmergroupherbalFound []',farmergroupherbalFound)

//     if (farmergroupherbalFound) {
//       // res.status(200).json(farmergroupherbalFound)
//       // console.log('farmergroupherbalFound',farmergroupherbalFound)

//       const newResult = farmergroupherbalFound.map(async (item) => {
//         console.log('farmergroupherbalFound in MAP')
//         const herbalFound = await herbal.findOne({where: {id: item.herbalId}})
//         if (herbalFound) {
//           console.log('herbalFound herbalname',herbalFound.herbalname)
//           item.herbalname = herbalFound.herbalname
//           // item = {...{herbalname: herbalFound.herbalname}, item}
//         }
//           // item = {...{herbalname: herbalFound.herbalname}, ...item}
//         return item
//       })

//       Promise.all(newResult).then((data) => {
//         res.status(200).json({
//           status: 'ok',
//           result: data,
//         })
//       })

//     } else {
//       res.status(500).json({
//         result: 'not found',
//       })
//     }
//   } catch (error) {
//     res.status(500).json({
//       error,
//     })
//   }
// })

module.exports = router
