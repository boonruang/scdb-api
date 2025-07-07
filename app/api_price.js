const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const priceyear = require('../models/priceyear')
const priceday = require('../models/priceday')
const constants = require('../config/constant')
const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')
const { QueryTypes } = require('sequelize');
const Op = Sequelize.Op
const request = require('request-promise')
const cheerio = require('cheerio')
const JwtMiddleware = require('../config/Jwt-Middleware')
const moment = require('moment-timezone')

//  @route                  GET  /api/v2/price/year
//  @desc                   list all priceyears
//  @access                 Private
router.get('/year', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get price year API called')
  try {
    const priceyearFound = await priceyear.findAll({
      order: [
        ['id','ASC']
      ],
    })
    if (priceyearFound) {
      console.log('priceyearFound in list API: ', priceyearFound)
      res.status(200).json({
        status: 'ok',
        result: priceyearFound,
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

//  @route                  GET  /api/v2/priceyear/list/:years/:product
//  @desc                   list priceyears
//  @access                 Private
router.get('/year/:years/:product', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get priceyears list API called')
  let priceyearStart = parseFloat(req.params.years.split('-')[0])  
  let priceyearEnd = parseFloat(req.params.years.split('-')[1])  
  let searchProducts = req.params.product.split(',')
  console.log('searchProducts',searchProducts)
  console.log('priceyearStart, priceyearEnd', priceyearStart + ' || ' + priceyearEnd)


  let dataObj = Object.entries(searchProducts).map(([key, val]) => ({id: val}))

  // console.log('dataObj',dataObj)

  if (req.params.years) {

    try {
      // const priceyearFound = await priceyear.findAll({
      //     where: {
      //       [Op.and]: [
      //         {year: {[Op.gte]: priceyearStart}},                    
      //         {year: {[Op.lte]: priceyearEnd}},
      //         {product: {[Op.in]: searchProducts }},
      //       ]
      //     }
      // })

      const newResults = dataObj.map(async (result) => {
        // console.log('result',result)
        const productFound = await priceyear.findAll({
            where: {
              [Op.and]: [
                {year: {[Op.gte]: priceyearStart}},                    
                {year: {[Op.lte]: priceyearEnd}},
                {product: {[Op.eq]: result.id }},
              ]
            },
            order: [
              ['year', 'ASC']
            ]
        })   

        result.data = productFound
        return result
      })

    //   if (thisData.length > 0) {
    //     res.status(200).json({
    //     status: 'ok',
    //     result: thisData,
    //   })
    // }

    
    Promise.all(newResults).then((data) => {
      // console.log(data)
        res.status(200).json({
          status: 'ok',
          result: data,
        })
    })

      // if (priceyearFound) {
      //   console.log('priceyearFound in list API: ', priceyearFound)
      //   res.status(200).json({
      //     status: 'ok',
      //     result: priceyearFound,
      //   })
      // } else {
      //   res.status(500).json({
      //     status: 'nok',
      //   })
      // }
    } catch (error) {
      res.status(500).json({
        Error: error.toString(),
      })
    }

  } else {
    console.log('no req.params')
  }
})

//  @route                  GET  /api/v2/price/date
//  @desc                   get scraping price
//  @access                 Private
router.get('/day', JwtMiddleware.checkToken, async (req, res) => {
  console.log('herbal price day scraping is called')

  const URL = 'https://j-pad.net/%E0%B8%A3%E0%B8%B2%E0%B8%84%E0%B8%B2%E0%B8%AA%E0%B8%B4%E0%B8%99%E0%B8%84%E0%B9%89%E0%B8%B2%E0%B8%A7%E0%B8%B1%E0%B8%99%E0%B8%99%E0%B8%B5%E0%B9%89?cate=12';

  // let todayDetail = moment().format('DD-MM-YYYY HH:mm:ss')
  // console.log('todayDetail is ',todayDetail)
  
  let today = moment().tz('Asia/Bangkok').format('DD-MM-YYYY')
  console.log('Today is',today)

  try {

    const resultToday = await priceday.findAll({ where: { date : today }})
    if (resultToday.length > 0) {
      // console.log('today data', resultToday)
      res.status(200).json({
        status: 'ok',
        result: resultToday,
      })
    } else {
        const response = await request(URL)
        let $ = cheerio.load(response)
    
        const data = [...$("table.table-bordered")].map(e =>
          Object.fromEntries([...$(e).find("tr")].map(e =>
            [...$(e).find("a,span")].map(e => $(e).text())
          ))
        );
    
        let converted = Object.entries(data[0]).map(([key,value]) => ({
          name: key,
          price: parseFloat(value),
          unit : 'ราคา/กก./หน่วย',
          date: today
        }) );
        // console.log(converted);
    
        let dialypriceData = converted.slice(1) //to remove first object 
        // console.log('dialypriceData',dialypriceData)


        const result = await priceday.bulkCreate(dialypriceData);
    
        if (result) {
          res.status(200).json({
            status: 'ok',
            result: result,
          })
          } else {
          res.status(500).json({
            result: 'not found',
          })
        }

    }

  } catch (error) {
    res.status(500).json({
      error,
    })
  }
})


module.exports = router
