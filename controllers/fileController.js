const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { body, validationResult } = require("express-validator")
const asyncHandler = require('express-async-handler')

const multer = require('multer')
const { createClient } = require('@supabase/supabase-js')
const supabaseUrl = process.env.SUPA_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)
// const storage = multer.memoryStorage()
const upload = multer({dest: 'uploads'})
const { decode } = require('base64-arraybuffer')
const path = require('path');
const fs = require('fs');


exports.getFiles = asyncHandler(async (req, res) => {
  try {
    const folderName = req.query.folder;
    // const folder = await prisma.folder.findFirst({ where: { name: folderName } });
    const files = await prisma.file.findMany({
      where:{ folderId: folderName }
    });
   
    res.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Error fetching files' });
  }

});

exports.postFile = asyncHandler( async(req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    
    const file = req.file;
    const filePath = path.join(file.path);

    // Read file content
    const fileContent = fs.readFileSync(filePath);
    
    const decodedFile = decode(file.originalname.toString('base64'));
    console.log(decodedFile)

    // Upload to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('newFiles')
      .upload(`${req.user.id}/${file.originalname}`, fileContent, {
        contentType: file.mimetype,
      });
    console.log(data)
    if(error) throw new Error(`Supabase upload error: ${error.message}`)
    const { data: publicURL, error: urlError } = supabase
      .storage
      .from('newFiles')
      .getPublicUrl(data.path)
    
    if(urlError) throw new Error(`Error getting public URL: ${urlError.message}`)

    if (error) throw error;

  
    fs.unlinkSync(filePath);
    console.log(publicURL)
    
    const savedFile = await prisma.file.create({
      data: {
        name: file.originalname,
        size: file.size,
        url: publicURL.publicUrl,
        folderId: req.body.folderId // Assuming you're sending the folder ID
      }
    });

    res.status(200).json({ message: 'File uploaded successfully', file: savedFile });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Server:Failed to upload file' });
  }
})

exports.deleteFile = asyncHandler( async(req,res) => {
  const fileId = req.params.fileId
  const fileName = req.params.fileName
  const filePath = `${req.user.id}/${fileName}`
  console.log(filePath)
  console.log(fileId)
  try {
    await prisma.file.delete({
      where: {
        id: fileId
      }
    })

    const { data, error } = await supabase
      .storage
      .from('newFiles')
      .remove([filePath])

    if(error) throw error
    res.redirect('/')
  } catch(error) {
    res.status(500).json({ error: 'Internal Server Error'})
  }
})
exports.downloadFile = asyncHandler(async(req,res) => {
  const fileId = req.params.fileId
  try {
    const fileURL = await prisma.file.findUnique({
      where: {
        id: fileId
      },
      select: {
        name: true
      }
    })
    const filePath = `${req.user.id}/${fileURL.name}`
    console.log(filePath)
    const { data, error } = await supabase
      .storage
      .from('newFiles')
      .download(filePath)
      // .getPublicUrl(fileURL.url, {
      //   download: true,
      // })
    console.log(data.type)
    const buffer = await data.arrayBuffer();
    const fileBuffer = Buffer.from(buffer)
    res.set({
      "Content-Type": data.type,
      "Content-Disposition": `attachment; filename="${fileURL.name}"`,
    });
    res.send(fileBuffer)
    if (error) throw error
  } catch(error) {
    res.status(500).json({error: 'Internal Server Error'})
  }
})