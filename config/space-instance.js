const { S3Client, PutObjectCommand, DeleteObjectCommand  } = require('@aws-sdk/client-s3');

const ACCESSKEYID = process.env.NODE_ENV_SPACES_ACCESS_ID
const SECRETACCESSKEY = process.env.NODE_ENV_SPACES_SECRET_KEY
const ENDPOINT = process.env.NODE_ENV_SPACES_END_POINT
const REGION = process.env.NODE_ENV_SPACES_REGION

const s3Client = new S3Client({
    forcePathStyle: false,
    region: REGION, // เปลี่ยนเป็น region ของ Space คุณ เช่น 'sgp1'
    endpoint: ENDPOINT, // เปลี่ยน URL ให้ตรงกับ Space ของคุณ
    credentials: {
        accessKeyId: ACCESSKEYID, // ใส่ Access Key ที่ได้จาก DigitalOcean
        secretAccessKey: SECRETACCESSKEY, // ใส่ Secret Key ที่ได้จาก DigitalOcean
  },
});

module.exports = {s3Client, PutObjectCommand, DeleteObjectCommand  }