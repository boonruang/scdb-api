const express = require('express')
const publication = require('../../models/sciences/publication')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const router = express.Router()

//  @route                  GET  /api/v2/dashboard/list
//  @desc                   list all dashboard
//  @access                 Private
router.get('/list', async (req, res) => {
  console.log('get dashboard list API called')

  const scopusQ1 = await publication.count({
    where: {
      [Op.and]: [
        { quartile: "Q1" },
        { database_source: {[Op.like]: '%Scopus%'}  }
      ]
    }
  });

  const scopusQ2 = await publication.count({
    where: {
      [Op.and]: [
        { quartile: "Q2" },
        { database_source: {[Op.like]: '%Scopus%'}  }
      ]
    }
  });
  const scopusQ3 = await publication.count({
    where: {
      [Op.and]: [
        { quartile: "Q3" },
        { database_source: {[Op.like]: '%Scopus%'}  }
      ]
    }
  });
  const scopusQ4 = await publication.count({
    where: {
      [Op.and]: [
        { quartile: "Q4" },
        { database_source: {[Op.like]: '%Scopus%'}  }
      ]
    }
  });

  const scopusTier1 = await publication.count({
    where: {
      [Op.and]: [
        { quartile: "Tier1" },
        { database_source: {[Op.like]: '%Scopus%'}  }
      ]
    }
  });

  const isiQ1 = await publication.count({
    where: {
      [Op.and]: [
        { quartile: "Q1" },
        { database_source: {[Op.like]: '%ISI%'}  }
      ]
    }
  });

    const isiQ2 = await publication.count({
    where: {
      [Op.and]: [
        { quartile: "Q2" },
        { database_source: {[Op.like]: '%ISI%'}  }
      ]
    }
  });

    const isiQ3 = await publication.count({
    where: {
      [Op.and]: [
        { quartile: "Q3" },
        { database_source: {[Op.like]: '%ISI%'}  }
      ]
    }
  });

    const isiQ4 = await publication.count({
    where: {
      [Op.and]: [
        { quartile: "Q3" },
        { database_source: {[Op.like]: '%ISI%'}  }
      ]
    }
  });

    const isiNA = await publication.count({
    where: {
      [Op.and]: [
        { quartile: {[Op.notLike]: 'Q%'} },
        { database_source: {[Op.like]: '%ISI%'}  }
      ]
    }
  });

  let publicationScopusResult = [
            {
                "publication": "Q1",
                "scopus": scopusQ1,
            },
            {
                "publication": "Q2",
                "scopus": scopusQ2,
            },
            {
                "publication": "Q3",
                "scopus": scopusQ3,
            },
            {
                "publication": "Q4",
                "scopus": scopusQ4,
            },
            {
                "publication": "Tier1",
                "scopus": scopusTier1,
            },            
        ]        

    let publicationISIResult = [
            {
                "publication": "Q1",
                "ISI(SCIE)": isiQ1,
            },
            {
                "publication": "Q2",
                "ISI(SCIE)": isiQ2,
            },
            {
                "publication": "Q3",
                "ISI(SCIE)": isiQ3,
            },
            {
                "publication": "Q4",
                "ISI(SCIE)": isiQ4,
            },
            {
                "publication": "N/A",
                "ISI(SCIE)": isiNA,
            },            
        ] 
        
//   let academyWorkResult = [
//             {
//                 "catalog": "Biology",
//                 "academic": 40,
//                 "international": 30,
//                 "student": 35,
//                 "staff": 20,
//                 "teacher": 35,
//             },
//             {
//                 "catalog": "Chemistry",
//                 "academic": 78,
//                 "domestic": 10,
//                 "international": 27,
//                 "student": 78,
//                 "staff": 30,
//                 "teacher": 25,
//             },
//             {
//                 "catalog": "Physics",
//                 "academic": 56,
//                 "domestic": 7,
//                 "international": 25,
//                 "student": 10,
//                 "staff": 21,
//                 "teacher": 32,
//             },
//             {
//                 "catalog": "Mathematics",
//                 "academic": 35,
//                 "domestic": 5,
//                 "international": 18,
//                 "student": 15,
//                 "staff": 30,
//                 "teacher": 42,
//             }
//         ]

  try {
    let dashboard = {
      publicationScopus: publicationScopusResult,
      publicationISI: publicationISIResult,
    //   academicWork: academyWorkResult,
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
