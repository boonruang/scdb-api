const express = require('express')
const student = require('../../models/sciences/student')
const staff = require('../../models/sciences/staff')
const user = require('../../models/user')
const log = require('../../models/log')
const router = express.Router()

//  @route                  GET  /api/v2/dashboard/list
//  @desc                   list all dashboard
//  @access                 Private
router.get('/list', async (req, res) => {
  console.log('get dashboard list API called')

    let planProjectResult = [
            {
                "publication": "Q1",
                "project": 15,
            },
            {
                "publication": "Q2",
                "project": 20,
            },
            {
                "publication": "Q3",
                "project": 10,
            },
            {
                "publication": "Q4",
                "project": 8,
            },
        ]

    let planBudgetResult = [
            {
                "publication": "Q1",
                "budget": 72,
            },
            {
                "publication": "Q2",
                "budget": 99,
            },
            {
                "publication": "Q3",
                "budget": 22,
            },
            {
                "publication": "Q4",
                "budget": 11,
            },
        ]


  try {
    let dashboard = {
      planProject: planProjectResult,
      planBudget: planBudgetResult,
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
