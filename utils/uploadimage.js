const fs = require("fs");
const path = require("path");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { s3Client } = require('../config/s3-instance')
const herbal = require('../models/herbal')
const zlib = require("zlib");

const uploadImage = async (files, doc, error, res) => {
  if (error) {
    console.error(error);
    res.status(500).send('Error parsing the file.');  
  }

  const file = files?.image
  
  if (!file) {
      res.status(400).send('No file uploaded.');
  }

  try {
    // อ่านไฟล์ในรูปแบบ Buffer
    // const fileContent = fs.readFileSync(file.filepath);
    const fileBuffer = fs.readFileSync(file.filepath);
    const gzipBuffer = zlib.gzipSync(fileBuffer);
    // กำหนด Content-Type ตามไฟล์
    const contentType = file.mimetype || "application/octet-stream";

    // สร้างชื่อไฟล์ใหม่แบบสุ่ม
    const randomFileName = `${Date.now()}_${path.basename(file.originalFilename)}`;
    const s3Key = `herbals/images/${randomFileName}`;

    // ตั้งค่าการอัปโหลด
    const params = {
      Bucket: "herbhuk",
      Key: s3Key,
      Body: gzipBuffer,
      ContentType: "image/jpeg",
      ContentEncoding: "gzip",
    };

    // ส่งคำสั่งไปยัง S3
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    console.log("Upload successful:", s3Key);

    // อัปเดตข้อมูลในฐานข้อมูล
    const result = await herbal.update(
      { image: randomFileName },
      { where: { id: doc.id } }
    );

    return result;
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).send('Error uploading the file.');
    throw new Error("Error uploading the file.");
  }
};

module.exports = { uploadImage };