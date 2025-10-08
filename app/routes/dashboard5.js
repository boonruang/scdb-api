const express = require('express')
const project = require('../../models/sciences/project')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const router = express.Router()

//  @route                  GET  /api/v2/dashboard/list
//  @desc                   list all dashboard
//  @access                 Private
router.get('/list', async (req, res) => {
  console.log('get dashboard list API called')

  
const currentYear = new Date().getFullYear();

const Q1_START = `${currentYear}-01-01`;
const Q1_END = `${currentYear}-03-31`;

const Q2_START = `${currentYear}-04-01`;
const Q2_END = `${currentYear}-06-30`;

const Q3_START = `${currentYear}-07-01`;
const Q3_END = `${currentYear}-09-30`;

const Q4_START = `${currentYear}-10-01`;
const Q4_END = `${currentYear}-12-31`;


// Q1
  const projectMathemeticsQ1 = await project.count({
    where: {
      [Op.and]: [
        { start_date: { [Op.lte]: Q1_END } },
        { end_date: { [Op.gte]: Q1_START } },
        { responsible_dept_id: 1 }
      ]
    }
  });

  const projectPhysicsQ1 = await project.count({
    where: {
      [Op.and]: [
        { start_date: { [Op.lte]: Q1_END } },
        { end_date: { [Op.gte]: Q1_START } },
        { responsible_dept_id: 2 }
      ]
    }
  });

  const projectBiologyQ1 = await project.count({
    where: {
      [Op.and]: [
        { start_date: { [Op.lte]: Q1_END } },
        { end_date: { [Op.gte]: Q1_START } },
        { responsible_dept_id: 3 }
      ]
    }
  });

  const projectChemistryQ1 = await project.count({
    where: {
      [Op.and]: [
        { start_date: { [Op.lte]: Q1_END } },
        { end_date: { [Op.gte]: Q1_START } },
        { responsible_dept_id: 4 }
      ]
    }
  });  

//Q2
  const projectMathemeticsQ2 = await project.count({
    where: {
      [Op.and]: [
        { start_date: { [Op.lte]: Q2_END } },
        { end_date: { [Op.gte]: Q2_START } },
        { responsible_dept_id: 1 }
      ]
    }
  });

  const projectPhysicsQ2 = await project.count({
    where: {
      [Op.and]: [
        { start_date: { [Op.lte]: Q2_END } },
        { end_date: { [Op.gte]: Q2_START } },
        { responsible_dept_id: 2 }
      ]
    }
  });

  const projectBiologyQ2 = await project.count({
    where: {
      [Op.and]: [
        { start_date: { [Op.lte]: Q2_END } },
        { end_date: { [Op.gte]: Q2_START } },
        { responsible_dept_id: 3 }
      ]
    }
  });

  const projectChemistryQ2 = await project.count({
    where: {
      [Op.and]: [
        { start_date: { [Op.lte]: Q2_END } },
        { end_date: { [Op.gte]: Q2_START } },
        { responsible_dept_id: 4 }
      ]
    }
  }); 

//Q3
  const projectMathemeticsQ3 = await project.count({
    where: {
      [Op.and]: [
        { start_date: { [Op.lte]: Q3_END } },
        { end_date: { [Op.gte]: Q3_START } },
        { responsible_dept_id: 1 }
      ]
    }
  });

  const projectPhysicsQ3 = await project.count({
    where: {
      [Op.and]: [
        { start_date: { [Op.lte]: Q3_END } },
        { end_date: { [Op.gte]: Q3_START } },
        { responsible_dept_id: 2 }
      ]
    }
  });

  const projectBiologyQ3 = await project.count({
    where: {
      [Op.and]: [
        { start_date: { [Op.lte]: Q3_END } },
        { end_date: { [Op.gte]: Q3_START } },
        { responsible_dept_id: 3 }
      ]
    }
  });

  const projectChemistryQ3 = await project.count({
    where: {
      [Op.and]: [
        { start_date: { [Op.lte]: Q3_END } },
        { end_date: { [Op.gte]: Q3_START } },
        { responsible_dept_id: 4 }
      ]
    }
  });   

//Q4
  const projectMathemeticsQ4 = await project.count({
    where: {
      [Op.and]: [
        { start_date: { [Op.lte]: Q4_END } },
        { end_date: { [Op.gte]: Q4_START } },
        { responsible_dept_id: 1 }
      ]
    }
  });

  const projectPhysicsQ4 = await project.count({
    where: {
      [Op.and]: [
        { start_date: { [Op.lte]: Q4_END } },
        { end_date: { [Op.gte]: Q4_START } },
        { responsible_dept_id: 2 }
      ]
    }
  });

  const projectBiologyQ4 = await project.count({
    where: {
      [Op.and]: [
        { start_date: { [Op.lte]: Q4_END } },
        { end_date: { [Op.gte]: Q4_START } },
        { responsible_dept_id: 3 }
      ]
    }
  });

  const projectChemistryQ4 = await project.count({
    where: {
      [Op.and]: [
        { start_date: { [Op.lte]: Q4_END } },
        { end_date: { [Op.gte]: Q4_START } },
        { responsible_dept_id: 4 }
      ]
    }
  });  

  let ProjectDeptbyQuater = [
          {
              quater : "Q1",
              Mathematics: projectMathemeticsQ1,
              Physics: projectPhysicsQ1,
              Biology: projectBiologyQ1,
              Chemistry: projectChemistryQ1,
          },
          {
              quater : "Q2",
              Mathematics: projectMathemeticsQ2,
              Physics: projectPhysicsQ2,
              Biology: projectBiologyQ2,
              Chemistry: projectChemistryQ2,
          },
          {
              quater : "Q3",
              Mathematics: projectMathemeticsQ3,
              Physics: projectPhysicsQ3,
              Biology: projectBiologyQ3,
              Chemistry: projectChemistryQ3,
          },
          {
              quater : "Q4",
              Mathematics: projectMathemeticsQ4,
              Physics: projectPhysicsQ4,
              Biology: projectBiologyQ4,
              Chemistry: projectChemistryQ4,
          },          
      ] 


  const projectQuater1 = await project.count({
    where: {
      [Op.and]: [
        { start_date: { [Op.lte]: Q1_END } },
        { end_date: { [Op.gte]: Q1_START } }
      ]
    }
  });

    const projectQuater2 = await project.count({
    where: {
      [Op.and]: [
        { start_date: { [Op.lte]: Q2_END } },
        { end_date: { [Op.gte]: Q2_START } }
      ]
    }
  });


    const projectQuater3 = await project.count({
    where: {
      [Op.and]: [
        { start_date: { [Op.lte]: Q3_END } },
        { end_date: { [Op.gte]: Q3_START } }
      ]
    }
  });


    const projectQuater4 = await project.count({
    where: {
      [Op.and]: [
        { start_date: { [Op.lte]: Q4_END } },
        { end_date: { [Op.gte]: Q4_START } }
      ]
    }
  });




    let planProjectResult = [
            {
                "publication": "Q1",
                "project": projectQuater1,
            },
            {
                "publication": "Q2",
                "project": projectQuater2,
            },
            {
                "publication": "Q3",
                "project": projectQuater3,
            },
            {
                "publication": "Q4",
                "project": projectQuater4,
            },
        ]


      const totalBudgetQ1 = await project.sum('budget_amount', {
        where: {
          [Op.and]: [
            { start_date: { [Op.lte]: Q1_END } },
            { end_date: { [Op.gte]: Q1_START } }
          ]
        }
      });
      

      const totalBudgetQ2 = await project.sum('budget_amount', {
        where: {
          [Op.and]: [
            { start_date: { [Op.lte]: Q2_END } },
            { end_date: { [Op.gte]: Q2_START } }
          ]
        }
      });      


      const totalBudgetQ3 = await project.sum('budget_amount', {
        where: {
          [Op.and]: [
            { start_date: { [Op.lte]: Q3_END } },
            { end_date: { [Op.gte]: Q3_START } }
          ]
        }
      });       

      const totalBudgetQ4 = await project.sum('budget_amount', {
        where: {
          [Op.and]: [
            { start_date: { [Op.lte]: Q4_END } },
            { end_date: { [Op.gte]: Q4_START } }
          ]
        }
      });         

    let planBudgetResult = [
            {
                "publication": "Q1",
                "budget": totalBudgetQ1,
            },
            {
                "publication": "Q2",
                "budget": totalBudgetQ2,
            },
            {
                "publication": "Q3",
                "budget": totalBudgetQ3,
            },
            {
                "publication": "Q4",
                "budget": totalBudgetQ4,
            },
        ]


  try {
    let dashboard = {
      projectDeptbyQuater: ProjectDeptbyQuater,
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
