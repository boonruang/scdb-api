const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const constants = require('../config/constant')
const JwtMiddleware = require('../config/Jwt-Middleware')
const Sequelize = require('sequelize')
const sequelize = require('../config/db-instance')
const herbal = require('../models/herbal')
const farmer = require('../models/farmer')
const farmergroup = require('../models/farmergroup')
const herbalmarketplace = require('../models/herbalmarketplace')
const collaborativefarm = require('../models/collaborativefarm')
const entrepreneurherbal = require('../models/entrepreneurherbal')
const entrepreneurmedical = require('../models/entrepreneurmedical')
const knowledgebase = require('../models/knowledgebase')
const user = require('../models/user')
const log = require('../models/log')
const manufacturer = require('../models/manufacturer')
const outsource = require('../models/outsource')
const philosopher = require('../models/philosopher')
const researchinnovation = require('../models/researchinnovation')
const { Op, fn, col } = require('sequelize');
//  @route                  GET  /api/v2/dashboard/list
//  @desc                   list all dashboards
//  @access                 Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get dashboard API called')
  
  try {
    // const provinces = ['มหาสารคาม', 'ร้อยเอ็ด', 'ขอนแก่น', 'กาฬสินธุ์'];
    const amountHerbal = await herbal.count()
    const amountFarmer = await farmer.count({
      where: {
        province: {
          [Op.or]: [
            { [Op.like]: '%มหาสารคาม%' },
            { [Op.like]: '%ร้อยเอ็ด%' },
            { [Op.like]: '%ขอนแก่น%' },
            { [Op.like]: '%กาฬสินธุ์%' }
          ]
        }
      }
    });

    const amountFarmergroup = await farmergroup.count({
      where: {
        province: {
          [Op.or]: [
            { [Op.like]: '%มหาสารคาม%' },
            { [Op.like]: '%ร้อยเอ็ด%' },
            { [Op.like]: '%ขอนแก่น%' },
            { [Op.like]: '%กาฬสินธุ์%' }
          ]
        }
      }
    });

    const amountCollaborativefarm = await collaborativefarm.count({
      where: {
        province: {
          [Op.or]: [
            { [Op.like]: '%มหาสารคาม%' },
            { [Op.like]: '%ร้อยเอ็ด%' },
            { [Op.like]: '%ขอนแก่น%' },
            { [Op.like]: '%กาฬสินธุ์%' }
          ]
        }
      }
    });

    const total = amountHerbal + amountFarmer + amountFarmergroup + amountCollaborativefarm
    const herbalPercent = amountHerbal / total
    const farmerPercent = amountFarmer / total
    const farmergroupPercent = amountFarmergroup / total
    const collaborativefarmPercent = amountCollaborativefarm / total
    
    
    const amountMarketplace = await herbalmarketplace.count()
    const amountEntrepreneurherbal = await entrepreneurherbal.count()
    const amountEntrepreneurmedical = await entrepreneurmedical.count()
    const amountKnowledgebase = await knowledgebase.count()
    const amountUser = await user.count()
    const amountLog = await log.count()
    const amountManufacturer= await manufacturer.count()
    const amountOutsource = await outsource.count()
    const amountPhilosopher = await philosopher.count()
    const amountResearchinnovation = await researchinnovation.count()

    const total2 = amountMarketplace + amountEntrepreneurherbal +  amountKnowledgebase + amountUser +  amountEntrepreneurmedical +
    amountManufacturer +  amountOutsource + amountPhilosopher + amountResearchinnovation
    const amountMarketplacePercent = amountMarketplace / total2
    const amountEntrepreneurherbalPercent = amountEntrepreneurherbal / total2
    const amountKnowledgebasePercent = amountKnowledgebase / total2 
    const amountUserPercent = amountUser / total2 
    const amountEntrepreneurmedicalPercent = amountEntrepreneurmedical / total2 
    const amountManufacturerPercent = amountManufacturer / total2 
    const amountOutsourcePercent = amountOutsource / total2 
    const amountPhilosopherPercent = amountPhilosopher / total2 
    const amountResearchinnovationPercent = amountResearchinnovation / total2 

    
// 1. รายชื่อจังหวัด
const provinces = ['มหาสารคาม', 'ร้อยเอ็ด', 'ขอนแก่น', 'กาฬสินธุ์'];

// 2. เตรียมเงื่อนไข LIKE
const provinceConditions = provinces.map(province => ({
  province: { [Op.like]: `%${province}%` }
}));

// 3. นับแต่ละตารางแยกกัน
const [farmers, farmergroups, collaborativefarms] = await Promise.all([
  farmer.findAll({
    attributes: ['province', [fn('COUNT', col('id')), 'total']],
    where: {
      [Op.or]: provinceConditions
    },
    group: ['province']
  }),
  farmergroup.findAll({
    attributes: ['province', [fn('COUNT', col('id')), 'total']],
    where: {
      [Op.or]: provinceConditions
    },
    group: ['province']
  }),
  collaborativefarm.findAll({
    attributes: ['province', [fn('COUNT', col('id')), 'total']],
    where: {
      [Op.or]: provinceConditions
    },
    group: ['province']
  })
]);

// 4. รวมผลลัพธ์แยกตามจังหวัด
const resultMap = {};

// 5. helper function เพื่อ merge พร้อม trim ชื่อจังหวัด
function mergeCountToProvince(data, keyName) {
  data.forEach(row => {
    const provinceRaw = row.get('province');
    const province = provinceRaw.trim(); // ⭐️ ตัด space ซ้าย-ขวา ออกก่อน
    const count = parseInt(row.get('total'), 10);

    if (!resultMap[province]) {
      resultMap[province] = { province, farmer: 0, farmergroup: 0, collaborativefarm: 0 };
    }
    resultMap[province][keyName] = count;
  });
}

// 6. รวมข้อมูลจากทั้ง 3 ชุด
mergeCountToProvince(farmers, 'farmer');
mergeCountToProvince(farmergroups, 'farmergroup');
mergeCountToProvince(collaborativefarms, 'collaborativefarm');

// 7. แปลงเป็น array เรียงตามลำดับจังหวัดที่ต้องการ
const finalResult = provinces.map(province => {
  // หา province ที่ชื่อมี keyword ตรงกับที่เราต้องการ
  const foundProvinceKey = Object.keys(resultMap).find(name => name.includes(province));
  if (foundProvinceKey) {
    return resultMap[foundProvinceKey];
  }
  return {
    province,
    farmer: 0,
    farmergroup: 0,
    collaborativefarm: 0
  };
});

    let dashboard = {
      herbal : amountHerbal,
      farmer : amountFarmer,
      farmercheck : amountFarmer,
      farmergroup : amountFarmergroup,
      collaborativefarm : amountCollaborativefarm,
      herbalpercent : herbalPercent.toFixed(2),
      farmerpercent : farmerPercent.toFixed(2),
      farmergrouppercent : farmergroupPercent.toFixed(2),
      collaborativefarmpercent : collaborativefarmPercent.toFixed(2),
      marketplace : amountMarketplace,
      entrepreneurherbal : amountEntrepreneurherbal,
      knowledgebase : amountKnowledgebase,
      user : amountUser,
      log : amountLog,
      nanufacturer : amountManufacturer,
      outsource : amountOutsource,
      philosopher : amountPhilosopher,
      researchinnovation : amountResearchinnovation,
      marketplacepercent : amountMarketplacePercent.toFixed(2),
      entrepreneurherbalpercent : amountEntrepreneurherbalPercent.toFixed(2),
      entrepreneurmedicalpercent :  amountEntrepreneurmedicalPercent.toFixed(2),
      knowledgebasepercent : amountKnowledgebasePercent.toFixed(2),
      userpercent : amountUserPercent.toFixed(2),
      manufacturerpercent : amountManufacturerPercent.toFixed(2),
      outsourcepercent : amountOutsourcePercent.toFixed(2),
      philosopherpercent : amountPhilosopherPercent.toFixed(2),
      researchinnovationpercent:  amountResearchinnovationPercent.toFixed(2),
      farmersummary: finalResult,
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
