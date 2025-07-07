const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const philosopher = require('../models/philosopher')
const constants = require('../config/constant')
const Sequelize = require('sequelize')
const JwtMiddleware = require('../config/Jwt-Middleware')
const Op = Sequelize.Op
const path = require('path');
const fs = require('fs');
const { s3Client, PutObjectCommand, DeleteObjectCommand } = require('../config/space-instance')


const uploadImage = async (files, doc, error, res) => {
  if (error) {
    console.error(error);
    res.status(500).send('Error parsing the file.');  
  }
  
  const file = files.photo
  
  if (!file) {
      res.status(400).send('No file uploaded.');
  }

  try {

    if (doc && file) {

    const fileContent  = fs.readFileSync(file.filepath);

    const randomFileName = `${Date.now()}_${path.basename(file.originalFilename)}`;
    const s3Key = `herbals/images/${randomFileName}`;
    const contentType = file.mimetype;

    // const filename = getRandomFileName() + '_' + path.basename(file.originalFilename);

    const params = {
      Bucket: 'herbhuk',
      Key: s3Key,
      Body: fileContent,
      ContentType: contentType || "image/jpeg",
      ACL: 'public-read',
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    const result = philosopher.update(
        { photo: randomFileName },
        { where: { id: doc.id } }
    );

    return result;
  }

} catch (error) {
    console.error('Upload error:', error);
    res.status(500).send('Error uploading the file.');
}

}

//  @route                  GET  /api/v2/philosopher/list
//  @desc                   list all philosophers
//  @access                 Private
router.get('/list', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get philosopher API called')
  try {
    const philosopherFound = await philosopher.findAll({
      where: {
        status: { 
           [Op.eq] :  true
          } 
      },
      order: [
        ['id','DESC']
      ],
    })
    if (philosopherFound) {
      console.log('philosopherFound in list API: ', philosopherFound)
      res.status(200).json({
        status: 'ok',
        result: philosopherFound,
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

//  @route                  GET  /api/v2/philosopher/select/:id
//  @desc                   Get philosopher by Id
//  @access                 Private
router.get('/select/:id', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get philosopher by Id API called')
  let id = req.params.id

  try {
    const philosopherFound = await philosopher.findOne({
      where: { id }    
    })

    if (philosopherFound) {
      res.status(200).json({
        status: 'ok',
        result: philosopherFound,
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


//  @route                  POST  /api/v2/philosopher
//  @desc                   Post add philosopher
//  @access                 Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('philosopher add is called')
  
  try {
    const form = formidable({ multiples: false }); // กำหนดให้รับไฟล์เดียว
    // const form = new formidable.IncomingForm();
    console.log('form.parse(req)',form.parse(req))
    form.parse(req, async (error, fields, files) => {
      let result = await philosopher.create(fields);
      result = await uploadImage(files, result, error, res);
      // console.log('req files',files)
      // console.log('req fields',fields)
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

//  @route                  PUT  /api/v2/philosopher/
//  @desc                   Update philosopher use formidable on reactjs philosopherCreate
//  @access                 Private
router.put('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('philosopher put updated is called')
  try {
      // const form = formidable({ multiples: false }); // กำหนดให้รับไฟล์เดียว
      const form = new formidable.IncomingForm();
      // console.log('form.parse(req)',form.parse(req))
      form.parse(req, async (error, fields, files) => {

      const { id, photo, ...rest } = fields
      console.log('rest data', rest)

      // const philosopherFound = await philosopher.findOne({where : {id : fields.id}})

      console.log('Formidable Update files: ', Object.keys(files).length)
      console.log('Formidable Update photo: ', photo)
      console.log('Formidable Update fields: ', fields)
      console.log('Formidable Update Error: ', error)

        console.log('i am gotta fields.id',fields.id)
        // let result = philosopher.update(
        //   { photo: filename },
        //   { where: { id: doc.id } }
        // );        
      let result = await philosopher.update({...rest},{where: { id: fields.id }})

      if (result && Object.keys(files).length !== 0) {
        result = await uploadImage(files, fields, error, res);
        console.log('put result', result)
        res.json({
          result: constants.kResultOk,
          message: JSON.stringify(result)
        });        
      } else {
        res.json({
          result: constants.kResultNok,
          message: JSON.stringify(error)
        });        
      }


    });
  } catch (error) {
    res.json({
      result: constants.kResultNok,
      message: JSON.stringify(error)
    });
  }
});

//  @route                  DELETE  /api/v2/philosopher/:id
//  @desc                   Delete by id
//  @access                 Private
router.delete('/:id', JwtMiddleware.checkToken, async (req, res) => {
  console.log('philosopher deleted is called')
  try {
    const philosopherFound = await philosopher.findOne({ where: { id: req.params.id } })
    if (philosopherFound) {
      // philosopher found

      var params = {
        Bucket: 'herbhuk',
        Key: `herbals/images/${philosopherFound.photo}`,
      };

      const philosopherDeleted = await philosopher.destroy({
        where: {
          id: req.params.id,
        },
      })

      if (philosopherDeleted) {

        // const deleted = s3Client.deleteObject(params,function(err,data){
        //   if (err) {console.log(err,err.stack)}
        //   // else        console.log("Response:",data);
        //   })
        // .promise();
        const command = new DeleteObjectCommand(params)
        const deleted = await s3Client.send(command);        

        if (deleted) {
          console.log(`philosopher id: ${req.params.id} deleted`)
          res.status(200).json({
            result: constants.kResultOk,
            message: `philosopher id: ${req.params.id} deleted`,
          })
        }        

      } else {
        // philosopher delete failed
        console.log(`philosopher id: ${req.params.id} delete failed`)
        res.status(500).json({
          result: constants.kResultNok,
          message: `philosopher id: ${req.params.id} delete failed`,
        })
      }
    } else {
      // philosopher not found
      res.status(500).json({
        result: constants.kResultNok,
        message: 'philosopher not found',
      })
    }
  } catch (error) {
    res.status(500).json({
      result: constants.kResultNok,
      Error: error.toString(),
    })
  }
})

module.exports = router
