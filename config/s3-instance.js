const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const ACCESSKEYID = process.env.NODE_ENV_S3_ACCESS_ID
const SECRETACCESSKEY = process.env.NODE_ENV_S3_SECRET_KEY
const REGION = process.env.NODE_ENV_S3_REGION

const s3Client = new S3Client({
    forcePathStyle: false,
    region: REGION, 
    credentials: {
        accessKeyId: ACCESSKEYID, 
        secretAccessKey: SECRETACCESSKEY, 
  },
});

module.exports = {s3Client, PutObjectCommand, DeleteObjectCommand }