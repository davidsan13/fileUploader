const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { body, validationResult } = require("express-validator")
const asyncHandler = require('express-async-handler')

exports.getfiles = asyncHandler(async (req, res) => {
  try {
    
    const folderName = req.query.folder;
    const folder = await prisma.folder.findFirst({ where: { name: folderName } });
    const files = await prisma.file.findMany({
      where: { folderId: folder?.id }
    });
    res.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Error fetching files' });
  }
  
});