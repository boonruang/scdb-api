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

//  @route                  GET  /api/v2/entretype/list
//  @desc                   list all entretypes
//  @access                 Private
router.get('/fe/data', async (req, res) => {
  console.log('get entretype list API called')
  try {
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
    })
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

    const herbsAll = await herbal.findAll({
      include: [
        {
          model: farmer,
          through: { attributes: ['area'] } 
        },
        {
          model: farmergroup,
          through: { attributes: ['area'] }
        },
        {
          model: collaborativefarm,
          through: { attributes: ['area'] }
        }
      ]
    });
    

      // กรองเฉพาะ herbal ที่มีความสัมพันธ์
      const herbsFiltered = herbsAll.filter(h =>
        (h.farmers && h.farmers.length > 0) ||
        (h.farmergroups && h.farmergroups.length > 0) ||
        (h.collaborativefarms && h.collaborativefarms.length > 0)
      );

      // รวมค่า area จากทุกความสัมพันธ์
      let totalArea = 0;

      herbsFiltered.forEach(h => {
        const farmerArea = h.farmers?.reduce((sum, f) => sum + (f.farmerherbals?.area || 0), 0);
        const groupArea = h.farmergroups?.reduce((sum, g) => sum + (g.farmergroupherbals?.area || 0), 0);
        const collabArea = h.collaborativefarms?.reduce((sum, c) => sum + (c.collaborativefarmherbals?.area || 0), 0);

        totalArea += (farmerArea + groupArea + collabArea);
      });     

      let dashboard = {
        herbal : amountHerbal.toLocaleString('th-TH'),
        farmer : amountFarmer.toLocaleString('th-TH'),
        farmgroup : (amountFarmergroup + amountCollaborativefarm).toLocaleString('th-TH'),
        area: totalArea.toLocaleString('th-TH'),
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

 // 1. กำหนดจังหวัดที่ต้องการ
const provinces = ['มหาสารคาม', 'ร้อยเอ็ด', 'ขอนแก่น', 'กาฬสินธุ์'];

// 2. ดึงข้อมูลจากแต่ละตาราง โดยใช้ LIKE และรองรับชื่อที่มีช่องว่างด้วย
const [farmers, farmergroups, collaborativefarms] = await Promise.all([
  farmer.findAll({
    attributes: ['province', [fn('COUNT', col('id')), 'total']],
    where: {
      [Op.or]: provinces.map(name => ({
        province: { [Op.like]: `%${name}%` }
      }))
    },
    group: ['province']
  }),
  farmergroup.findAll({
    attributes: ['province', [fn('COUNT', col('id')), 'total']],
    where: {
      [Op.or]: provinces.map(name => ({
        province: { [Op.like]: `%${name}%` }
      }))
    },
    group: ['province']
  }),
  collaborativefarm.findAll({
    attributes: ['province', [fn('COUNT', col('id')), 'total']],
    where: {
      [Op.or]: provinces.map(name => ({
        province: { [Op.like]: `%${name}%` }
      }))
    },
    group: ['province']
  })
]);

// 3. เตรียม resultMap ไว้รวมข้อมูล
const resultMap = {};

// helper function สำหรับ merge และ .trim() ชื่อตอนเก็บข้อมูล
function mergeCountToProvince(data, keyName) {
  data.forEach(row => {
    const rawProvince = row.get('province') || '';
    const provinceName = rawProvince.trim(); // ตัดช่องว่างหน้าหลัง
    const count = parseInt(row.get('total'), 10);

    if (!resultMap[provinceName]) {
      resultMap[provinceName] = { province: provinceName, farmer: 0, farmergroup: 0, collaborativefarm: 0 };
    }

    resultMap[provinceName][keyName] += count;
  });
}

// 4. รวมข้อมูลจากทั้ง 3 ตาราง
mergeCountToProvince(farmers, 'farmer');
mergeCountToProvince(farmergroups, 'farmergroup');
mergeCountToProvince(collaborativefarms, 'collaborativefarm');

// 5. สร้าง finalResult โดยรวมชื่อจังหวัดที่ใกล้เคียงกันเข้าด้วยกัน
const finalResult = provinces.map(provinceKeyword => {
  const matchingProvinces = Object.keys(resultMap).filter(name => name.includes(provinceKeyword));

  // รวมข้อมูลของ province ที่ match ทั้งหมด
  const mergedData = matchingProvinces.reduce(
    (acc, name) => {
      acc.farmer += resultMap[name].farmer;
      acc.farmergroup += resultMap[name].farmergroup;
      acc.collaborativefarm += resultMap[name].collaborativefarm;
      return acc;
    },
    { province: provinceKeyword, farmer: 0, farmergroup: 0, collaborativefarm: 0 }
  );

  return mergedData;
});   

    let dashboard = {
      herbal : amountHerbal,
      farmer : amountFarmer,
      farmercheck : farmers,
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
