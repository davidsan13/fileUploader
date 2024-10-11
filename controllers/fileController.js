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
const upload = multer({dest: 'uploads/'})

const path = require('path');
const fs = require('fs');

exports.getFiles = asyncHandler(async (req, res) => {
  try {
    console.log(req.query.folder)
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

exports.postFile = asyncHandler( upload.single('file'), async(req, res) => {
  // if(!req.file) {
  //   return res.status(400).send('No file uploaded.');
  // }
  
  // try {
    
    // const filePath = path.join(__dirname, file.path)
    // console.log(file)
    // if(!file) {
    //   res.status(400).json({message: 'Please Upload a File'});
    //   return
    // }
    // const fileBase64 = decode(file.buffer.toString('base64'))
    
    // const { data, error } = await supabase.storage
    //   .from('files')
    //   .upload(file.originalname, fileBase64, {
    //     contentType: "image/png"
    //   })
    // if(error) {
    //   throw error;
    // }

    // const {data: doc} = supabase.storage
    //   .from('images')
    //   .getPublicUrl(data.path)
    // console.log(file)
    // res.status(200).json({ file: doc.publicUrl})
  //   res.status('400')
  // } catch(error) {
  //   console.error('Error')
  //   res.status(500).json({error: error})
  // }

  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  
  try {
    const file = req.file;
    const filePath = path.join(__dirname, file.path);
    console.log(file)
    // Read file content
    const fileContent = fs.readFileSync(filePath);

    // Upload to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('files')
      .upload(`files/${file.originalname}`, fileContent, {
        contentType: file.mimetype,
      });
    
    if(error) throw new Error(`Supabase upload error: ${error.message}`)
    const { publicURL, error: urlError } = supabase
      .storage
      .from('files')
      .getPublicUrl(`files/${file.originalname}`)
    
    if(urlError) throw new Error(`Error getting public URL: ${urlError.message}`)

    if (error) throw error;

    // Clean up the temporary file
    fs.unlinkSync(filePath);

    // Here, you might want to save the file metadata to your database
    // For example, using Prisma:
    const savedFile = await prisma.file.create({
      data: {
        name: file.originalname,
        size: file.size,
        url: data.path,
        folderId: req.body.folderId // Assuming you're sending the folder ID
      }
    });

    res.status(200).json({ message: 'File uploaded successfully', file: savedFile });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
})