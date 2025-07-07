const express = require('express')
const router = express.Router()
const formidable = require('formidable')
const post = require('../models/post')
const constants = require('../config/constant')
const Sequelize = require('sequelize')
const JwtMiddleware = require('../config/Jwt-Middleware')
const Op = Sequelize.Op
const path = require('path');
const fs = require('fs');
const { s3Client, PutObjectCommand, DeleteObjectCommand } = require('../config/space-instance')
const { formatThaiDateBuddhistEra }  = require('../utils/formatthaidate')

const uploadImage = async (files, doc, error, res) => {
  if (error) {
    console.error(error);
    res.status(500).send('Error parsing the file.');  
  }
  
  const file = files.image
  
  if (!file) {
      res.status(400).send('No file uploaded.');
  }

  try {

    if (doc && file) {

    const fileContent  = fs.readFileSync(file.filepath);

    const randomFileName = `${Date.now()}_${path.basename(file.originalFilename)}`;
    const s3Key = `herbals/posts/${randomFileName}`;
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

    const result = post.update(
        { image: randomFileName },
        { where: { id: doc.id } }
    );

    return result;
  }

} catch (error) {
    console.error('Upload error:', error);
    res.status(500).send('Error uploading the file.');
}
}


//  @route                  GET  /api/v2/post/list
//  @desc                   list all posts
//  @access                 Private
router.get('/list', async (req, res) => {
  console.log('get post API called')
  try {
    const postFound = await post.findAll({
      order: [
        ['id','DESC']
      ],
    })
    
    if (postFound) {
      // แปลงรูปแบบวันที่ในแต่ละรายการ
      const formattedPosts = postFound.map(post => {
        const formattedDate = formatThaiDateBuddhistEra(post.date);
        return {
          ...post.dataValues, // ใช้ dataValues สำหรับ Sequelize objects
          unformatdate: post.date,
          date: formattedDate,
        };
      });

      res.status(200).json({
        status: 'ok',
        result: formattedPosts,
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

//  @route                  GET  /api/v2/post/select/:id
//  @desc                   Get post by Id
//  @access                 Private
router.get('/select/:id', async (req, res) => {
  console.log('get post by Id API called')
  let id = req.params.id

  try {
    const postFound = await post.findOne({ where: { id } });

    if (postFound) {
      // const formattedDate = formatThaiDateBuddhistEra(postFound.date);
      
      // res.status(200).json({
      //   status: 'ok',
      //   result: {
      //     ...postFound.toJSON(),
      //     date: formattedDate,
      //   },
      // });

      res.status(200).json({
        status: 'ok',
        result: postFound
      });

      // update views
      await post.update(
        { views: postFound.views + 1 },
        { where: { id } }
      );
    } else {
      res.status(404).json({ result: 'not found' });
    }
  } catch (err) {
    console.error('Date formatting error:', err.message);
    res.status(500).json({ error: err.message });
  }

})


//  @route                  POST  /api/v2/post
//  @desc                   Post add post
//  @access                 Private
router.post('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('post add is called')
  
  try {
    const form = formidable({ multiples: false }); // กำหนดให้รับไฟล์เดียว
    // const form = new formidable.IncomingForm();
    // console.log('form.parse(req)',form.parse(req))
    form.parse(req, async (error, fields, files) => {
      console.log('req files',files)
      console.log('req fields',fields)
      let result = await post.create(fields);
      result = await uploadImage(files, result, error, res);
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

//  @route                  PUT  /api/v2/post/
//  @desc                   Update post use formidable on reactjs postCreate
//  @access                 Private
router.put('/', JwtMiddleware.checkToken, async (req, res) => {
  console.log('post put updated is called')
  try {
      // const form = formidable({ multiples: false }); // กำหนดให้รับไฟล์เดียว
      const form = new formidable.IncomingForm();
      // console.log('form.parse(req)',form.parse(req))
      form.parse(req, async (error, fields, files) => {

      const { id, image, ...rest } = fields
      console.log('rest data', rest)

      // const postFound = await post.findOne({where : {id : fields.id}})

      console.log('Formidable Update files: ', Object.keys(files).length)
      console.log('Formidable Update image: ', image)
      console.log('Formidable Update fields: ', fields)
      console.log('Formidable Update Error: ', error)

        console.log('i am gotta fields.id',fields.id)
        // let result = post.update(
        //   { image: filename },
        //   { where: { id: doc.id } }
        // );        
      let result = await post.update({...rest},{where: { id: fields.id }})

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

//  @route                  DELETE  /api/v2/post/:id
//  @desc                   Delete by id
//  @access                 Private
router.delete('/:id', JwtMiddleware.checkToken, async (req, res) => {
  console.log('post deleted is called')
  try {
    const postFound = await post.findOne({ where: { id: req.params.id } })
    if (postFound) {
      // post found

      var params = {
        Bucket: 'herbhuk',
        Key: `herbals/posts/${postFound.image}`,
      };

      const postDeleted = await post.destroy({
        where: {
          id: req.params.id,
        },
      })

      if (postDeleted) {

        // const deleted = s3Client.deleteObject(params,function(err,data){
        //   if (err) {console.log(err,err.stack)}
        //   // else        console.log("Response:",data);
        //   })
        // .promise();
        const command = new DeleteObjectCommand(params)
        const deleted = await s3Client.send(command);        

        if (deleted) {
          console.log(`post id: ${req.params.id} deleted`)
          res.status(200).json({
            result: constants.kResultOk,
            message: `post id: ${req.params.id} deleted`,
          })
        }        

      } else {
        // post delete failed
        console.log(`post id: ${req.params.id} delete failed`)
        res.status(500).json({
          result: constants.kResultNok,
          message: `post id: ${req.params.id} delete failed`,
        })
      }
    } else {
      // post not found
      res.status(500).json({
        result: constants.kResultNok,
        message: 'post not found',
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
