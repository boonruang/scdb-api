const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const herbal = require('../models/herbal')
const herbalimage = require('../models/herbalimage')
const farmer = require('../models/farmer')
const farmergroup = require('../models/farmergroup')
const constants = require('../config/constant')
const Sequelize = require('sequelize')
const property = require('../models/property')
const character = require('../models/character')
const benefit = require('../models/benefit')
const reference = require('../models/reference')
const nutrition = require('../models/nutrition')
const sequelize = require('../config/db-instance')
const { QueryTypes } = require('sequelize');
const Op = Sequelize.Op
const JwtMiddleware = require('../config/Jwt-Middleware')
// const request = require('request-promise')
// const cheerio = require('cheerio')
const collaborativefarm = require('../models/collaborativefarm')
// const fs = require('fs/promises');
const path = require('path');
const fs = require('fs');
const { s3Client, PutObjectCommand, DeleteObjectCommand } = require('../config/space-instance')
// const paginate = require('../utils/pagination')
const { ListBucketsCommand,ListObjectsV2Command, DeleteObjectsCommand } = require("@aws-sdk/client-s3");


const uploadImage = async (files, doc, error, res) => {
  console.log('herbal add uploadImage is called',files)
  // console.log('doc',doc)
  if (error) {
    console.error(error);
    res.status(500).send('Error parsing the file.');  
  }
  
  // const file = files?.image
  // const file = files
  
  if (!files) {
      // res.status(400).send('No file uploaded.');
      res.status(400);
      console.log('in !files')
  }

  try {

    if (doc && files) {

    const fileContent  = fs.readFileSync(files.filepath);
    
    const contentType = files.mimetype;

    // const filename = getRandomFileName() + '_' + path.basename(file.originalFilename);
    const randomFileName = `${Date.now()}_${path.basename(files.originalFilename)}`;
    const idFileName = `${doc.id}_${path.basename(files.originalFilename)}`;
    const s3Key = `herbals/images/${idFileName}`;

    const params = {
        Bucket: 'herbhuk',
        Key: s3Key,
        Body: fileContent,
        ContentType: contentType || "image/jpeg",
        ACL: 'public-read',
    };


    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    // const result = herbal.update(
    //     { image: randomFileName },
    //     { where: { id: doc.id } }
    // );
    
    const dataObj = {
      image: idFileName,
      herbalId: doc.id
    }


    // console.log('dataObjec',dataObj)

    const result = herbalimage.create(dataObj);
    
    console.log(result);

    return result;
  }

} catch (error) {
    console.error('Upload error:', error);
    res.status(500).send('Error uploading the file.');
}

}

const deleteHerbalImagesFromS3 = async (herbalId, existingImages = []) => {
  const prefix = `herbals/images/`;
  const listParams = {
    Bucket: 'herbhuk',
    Prefix: prefix,
  };

  try {
    const listedObjects = await s3Client.send(new ListObjectsV2Command(listParams));

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      console.log('No files found in S3.');
      return;
    }

    // สร้าง Set สำหรับไฟล์ที่ต้องเก็บไว้ (เพื่อความเร็วในการค้นหา)
    const existingImageSet = new Set(existingImages);

    const objectsToDelete = listedObjects.Contents
      .filter(obj => {
        const fileName = obj.Key.replace(prefix, ''); // ดึงแค่ชื่อไฟล์
        return (
          obj.Key.startsWith(`${prefix}${herbalId}_`) &&
          !existingImageSet.has(fileName) // ยกเว้นไฟล์ที่มีอยู่ใน existingImages
        );
      })
      .map(obj => ({ Key: obj.Key }));

    if (objectsToDelete.length === 0) {
      console.log('No files to delete from S3.');
      return;
    }

    const deleteParams = {
      Bucket: 'herbhuk',
      Delete: {
        Objects: objectsToDelete,
        Quiet: false,
      },
    };

    const deleteResult = await s3Client.send(new DeleteObjectsCommand(deleteParams));
    console.log('✅ Deleted from S3:', deleteResult.Deleted);
  } catch (err) {
    console.error('Error deleting from S3:', err);
  }
};

//  @route                  POST  /api/v2/herbal
//  @desc                   Post add herbal
//  @access                 Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('herbal add is called')
  
  try {
    const form = formidable({ multiples: true });
    // const form = formidable({ multiples: false });
    // const form = new formidable.IncomingForm({ multiples: true });
    // const form = new formidable.IncomingForm();
    // console.log('form.parse(req)',form.parse(req))
    form.parse(req, async (error, fields, files) => {

      // res.json({ message: 'check files', files });

      let result = await herbal.create(fields);

      let fileArray = [];
      
      if (Array.isArray(files.images)) {
        fileArray = files.images;
        console.log('fileArray is array',fileArray)
      } else {
        fileArray = [files.images];
        console.log('fileArray is not array')
      }

        const results = await Promise.all(fileArray.map(file => uploadImage(file, result, error, res)));
        res.json({ message: 'Upload successful', results });
  
        console.log('req fields',fields)
        console.log('req files',files)

    });
  } catch (error) {
    res.json({
      result: constants.kResultNok,
      message: JSON.stringify(error)
    });
  }
});


//  @route                  GET  /api/v2/herbal/list/:search
//  @desc                   list all herbals search
//  @access                 Private
router.get('/list/:search', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get herbal search API called')
  let searchText = req.params.search

  console.log('search text', searchText)

  const conditions = []

  // ตรวจสอบว่าเป็นตัวเลขหรือไม่
  const parsedId = parseInt(searchText)
  if (!isNaN(parsedId)) {
    conditions.push({ id: { [Op.eq]: parsedId } })
  }

  // เพิ่มการค้นหาจากชื่อ
  conditions.push({ herbalname: { [Op.like]: `%${searchText}%` } })

      try {
        const herbalFound = await herbal.findAll({
          where: {
            [Op.or]: conditions
          },
          limit: 20,
        })

    if (herbalFound) {
      console.log('herbalFound in list API: ', herbalFound)
      res.status(200).json({
        status: 'ok',
        result: herbalFound,
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

//  @route                  GET  /api/v2/herbal/show/:soil/:ph
//  @desc                   show all herbals by soil and ph
//  @access                 Private
router.get('/show/:ph/:soil', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get herbal show API called')
  let searchPh = req.params.ph
  let searchSoil = req.params.soil
  console.log ('ph and soil', searchPh + ' AND ' + searchSoil)
  let phInputStart = parseFloat(req.params.ph.split('-')[0])  
  let phInputEnd = parseFloat(req.params.ph.split('-')[1])  
  console.log ('phInputStart, phInputEnd', phInputStart + ' || ' + phInputEnd)

  if (req.params.ph && req.params.soil) {
    try {
      const herbalFound = await herbal.findAll({
          where: {
            [Op.and]: [
              {
                [Op.or]: [
                  {
                    [Op.and]: [
                      {phstart: {[Op.lte]: phInputStart}},
                      {phend: {[Op.gte]: phInputStart}},                    
                    ]
                  },
                  {
                    [Op.and]: [
                      {phstart: {[Op.lte]: phInputEnd}},
                      {phend: {[Op.gte]: phInputEnd}},                    
                    ]
                  },
                ]
              },
              {soil: {[Op.like]: '%' + searchSoil + '%'}},
            ]
          },
          limit: 10
      })

      if (herbalFound) {
        console.log('herbalFound in list API: ', herbalFound)
        res.status(200).json({
          status: 'ok',
          result: herbalFound,
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
  } else {
    console.log('no req.params')
  }
})

//  @route                  GET  /api/v2/herbal/list
//  @desc                   list all herbals
//  @access                 Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get herbal API called')
  try {
    const herbalFound = await herbal.findAll({
      order: [
        ['id','DESC']
      ],
      include : [
        {
          model: herbalimage,
          as: 'herbalimages', 
        },
        {
          model: farmer,
          through: {
            attributes: []
          }
        },
        {
          model: farmergroup,
          through: {
            attributes: []
          }
        },
        {
          model: collaborativefarm,
          through: {
            attributes: []
          }
        },
        // {
        //   model: property,
        //   through: {
        //     attributes: []
        //   }
        // },        
        // {
        //   model: character,
        //   through: {
        //     attributes: []
        //   }
        // },        
        // {
        //   model: benefit,
        //   through: {
        //     attributes: []
        //   }
        // },        
        // {
        //   model: reference,
        //   through: {
        //     attributes: []
        //   }
        // },        
        // {
        //   model: nutrition,
        //   through: {
        //     attributes: []
        //   }
        // },        
    ]
    })
    if (herbalFound) {
      console.log('herbalFound in list API: ', herbalFound)
      res.status(200).json({
        status: 'ok',
        result: herbalFound,
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

//  @route                  GET  /api/v2/herbal/shortlist
//  @desc                   list just id,herbalname for dropdown
//  @access                 Private
router.get('/shortlist', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get herbal API called')
  try {
    const herbalFound = await herbal.findAll({
      attributes : ['id','herbalname'] ,
      order: [
        ['id','ASC']
      ],
    })
    
    if (herbalFound) {
      res.status(200).json({
        status: 'ok',
        result: herbalFound,
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

//  @route                  GET  /api/v2/herbal/pricelist
//  @desc                   list just id,herbalname for dropdown
//  @access                 Private
router.get('/pricelist', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get herbal pricelist API called')
  try {
    const herbalFound = await herbal.findAll({
      where: {
        [Op.and]: [
          {
            rawprice: 
              {
                  [Op.ne] : null
              }
          }, 
          {
            productprice: 
              {
                [Op.ne] : null
              }
          }       
        ]
       },
      attributes : ['id','herbalname','rawprice','productprice'] ,
      order: [
        ['rawprice','DESC']
      ],
      limit: 100
    })
    
    if (herbalFound) {
      res.status(200).json({
        status: 'ok',
        result: herbalFound,
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

//  @route                  GET  /api/v2/herbal/:id
//  @desc                   Get herbal by Id
//  @access                 Private
router.get('/select/:id', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get herbal by Id API called')
  let id = req.params.id

  try {
    const herbalFound = await herbal.findOne({
      where: { id },
      include : [
        {
          model: herbalimage,
          as: 'herbalimages', 
        },
        {
        model: farmer,
          through: {
            attributes: []
          }
        },
        {
        model: farmergroup,
          through: {
            attributes: []
          }
        },
        {
          model: collaborativefarm,
          through: {
            attributes: []
          }
        },        
    //     {
    //       model: property,
    //       through: {
    //         attributes: []
    //       }
    //     },        
    //     {
    //       model: character,
    //       through: {
    //         attributes: []
    //       }
    //     },        
    //     {
    //       model: benefit,
    //       through: {
    //         attributes: []
    //       }
    //     },        
    //     {
    //       model: reference,
    //       through: {
    //         attributes: []
    //       }
    //     },        
    //     {
    //       model: nutrition,
    //       through: {
    //         attributes: []
    //       }
    //     },        
      ]
    })

    if (herbalFound) {
      // res.status(200).json(herbalFound)
      res.status(200).json({
        status: 'ok',
        result: herbalFound,
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


//  @route                  GET  /api/v2/herbal/newid
//  @desc                   Get new id
//  @access                 Private
router.get('/newid', JwtMiddleware.checkToken, async (req, res) => {
  console.log('herbal newid is called')
  
  try {
    const idFound = await herbal.findOne({
      order: [ [ 'id', 'DESC' ]],
    })

    if (idFound) {
      res.status(200).json({
        status: 'ok',
        result: idFound.dataValues.id+1,
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

//  @route                  GET  /api/v2/herbal/updated
//  @desc                   to update phStart and phEnd
//  @access                 Private
router.get('/updated', JwtMiddleware.checkToken, async (req, res) => {
  console.log('herbal updated is called')

  try {
    const phFound = await sequelize.query(`
      UPDATE herbals SET phstart=split_part(ph,'-',1)::real, phend=split_part(ph,'-',2)::real WHERE ph IS NOT NULL;
     `, {
         type: QueryTypes.UPDATE,
     }); 
 
     if (phFound) {
       res.status(200).json({
         status: 'ok',
         result: phFound,
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

//  @route                  GET  /api/v2/herbal/concat
//  @desc                   to update phStart and phEnd
//  @access                 Private
router.get('/concat', JwtMiddleware.checkToken, async (req, res) => {
  console.log('herbal concat herbalname with 1.jpg is called')

  try {
    
    const herbalFound = await herbal.findAll()

    // console.log('herbalFound',herbalFound)

    if (herbalFound) {

      const newObj = await herbalFound.map(async (item) => {
        if (item.herbalname.length > 0) {
          item.image = `${item.herbalname}1.jpg`
          await herbal.update({
            image : item.image
          },{ where : { id: item.id}})
        }
      })

      if (newObj) {
        res.status(200).json({
          status: 'ok',
          result: newObj,
        })
      }

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


//  @route                  DELETE  /api/v2/herbal/:id
//  @desc                   Delete by id
//  @access                 Private
router.delete('/:id', JwtMiddleware.checkToken, async (req, res) => {
  console.log('herbal deleted is called')
  try {
    const herbalFound = await herbal.findOne({ where: { id: req.params.id } })
    if (herbalFound) {
      // herbal found

      var params = {
        Bucket: 'herbhuk',
        Key: `herbals/images/${herbalFound.image}`,
      };

      const herbalDeleted = await herbal.destroy({
        where: {
          id: req.params.id,
        },
      })

      if (herbalDeleted) {

        // const deleted = s3Client.deleteObject(params,function(err,data){
        //   if (err) {console.log(err,err.stack)}
        //   // else        console.log("Response:",data);
        //   })
        // .promise();
        const command = new DeleteObjectCommand(params)
        const deleted = await s3Client.send(command);

        if (deleted) {
          console.log(`herbal id: ${req.params.id} deleted`)
          res.status(200).json({
            result: constants.kResultOk,
            message: `herbal id: ${req.params.id} deleted`,
          })
        }        

      } else {
        // herbal delete failed
        console.log(`herbal id: ${req.params.id} delete failed`)
        res.status(500).json({
          result: constants.kResultNok,
          message: `herbal id: ${req.params.id} delete failed`,
        })
      }
    } else {
      // herbal not found
      res.status(500).json({
        result: constants.kResultNok,
        message: 'herbal not found',
      })
    }
  } catch (error) {
    res.status(500).json({
      result: constants.kResultNok,
      Error: error.toString(),
    })
  }
})

//  @route                  DELETE  /api/v2/herbal/s3/:id
//  @desc                   Update herbal use formidable on reactjs herbalCreate
//  @access                 Private
router.delete('/s3/:id', JwtMiddleware.checkToken, async (req, res) => {
  console.log('herbal deleted s3 just for testing endpoint is called')
  try {
    const herbalFound = await herbal.findOne({ where: { id: req.params.id } })

    console.log('herbalFound',herbalFound)

    var params = {
      Bucket: 'herbhuk',
      Key: `herbals/images/${herbalFound.image}`,
    };    

  if (herbalFound) {

    const herbalDeleted = await herbal.destroy({
      where: {
        id: req.params.id,
      },
    })
    // console.log('herbalDeleted',herbalDeleted)

    
    if (herbalFound.image && herbalDeleted) {
      // const deleted = s3Client.deleteObject(params,function(err,data){
        //   if (err)  {
          //     console.log(err,err.stack);
          //   }  
          //   // else        console.log("Response:",data);
          // })
          // .promise();
      const command = new DeleteObjectCommand(params)
      const deleted = await s3Client.send(command);

      if (deleted) {
        res.status(400).json({
          status: 'ok',
          result: 'image deleted successfully'+deleted
        }) 
      }
    } else {
        res.status(400).json({
        status: constants.kResultNok,
        result: 'herbal not delete or image empty'
      })      
    }
    
  } else {
      res.status(200).json({
        result: constants.kResultNok,
        Error: 'Not found id'+req.params.id
      })  
  }
  } catch (e) {
    res.end
    // res.status(500).json({
    //   result: constants.kResultNok,
    //   Error: e.toString(),
    // })  
  }
})



//  @route                  PUT  /api/v2/herbal/
//  @desc                   Update herbal use formidable on reactjs herbalCreate
//  @access                 Private
router.put('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('herbal put updated is called')
  try {
      // const form = new formidable.IncomingForm();
      const form = formidable({ multiples: true });
      // console.log('form.parse(req)',form.parse(req))
      form.parse(req, async (error, fields, files) => {

      const { id, existingImages, ...rest } = fields
      
      console.log('req fields',fields)
      console.log('existingImages ',existingImages)
       // 1. ลบรูปทั้งหมดในฐานข้อมูล
      await herbalimage.destroy({where : { herbalId: fields.id}})

      // ลบใน space (s3) ไปด้วยเลย
      await deleteHerbalImagesFromS3(fields.id, JSON.parse(fields.existingImages || '[]'));

      
      // 2. อัปเดตข้อมูลหลัก
      await herbal.update({...rest},{where: { id: fields.id }})

      // 3. บันทึก existingImages กลับเข้า DB
      const keepImages = JSON.parse(existingImages || '[]');
      console.log('keepImages ',keepImages)
      const existingInsertResults = await Promise.all(
        keepImages.map(name =>
          herbalimage.create({
            image: name, // ชื่อไฟล์ใน S3 (เช่น 168373829_file1.jpg)
            herbalId: id,
          })
        )
      );      
      
       // 4. เตรียมอัปโหลดภาพใหม่
        let fileArray = [];
      
        if (Array.isArray(files.images)) {
          fileArray = files.images;
          console.log('fileArray is array',fileArray)
        } else {
          fileArray = [files.images];
          console.log('fileArray is not array')
        }
  
       const newUploadResults  = await Promise.all(fileArray.map(file => uploadImage(file, fields, error, res)));

        return res.json({
          message: 'Update completed',
          existing: existingInsertResults,
          newUploaded: newUploadResults,
        });

    });
  } catch (error) {
    res.json({
      result: constants.kResultNok,
      message: JSON.stringify(error)
    });
  }
});

//  @route                  PUT  /api/v2/herbal/
//  @desc                   Update herbal use formidable on reactjs herbalCreate
//  @access                 Private
router.get('/s3list', JwtMiddleware.checkToken, async (req, res) => {
  console.log('s3list is called')

  try {
    const data = await s3Client.send(new ListBucketsCommand({}));
    console.log("Buckets:", data.Buckets);
    res.json({
      result: constants.kResultOk,
      message:  data.Buckets
    });  
} catch (err) {
    console.error("Error", err);
}

})

module.exports = router
