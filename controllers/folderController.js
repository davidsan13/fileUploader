const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { body, validationResult } = require("express-validator")
const asyncHandler = require('express-async-handler')
var LocalStorage = require('node-localstorage').LocalStorage
const { createFolder, renameFolder, getFolders} = require('../util/folderUtils')
localStorage = new LocalStorage('./scratch')

exports.getFolderCreate = asyncHandler(async (req, res, next) => {
  res.render("foldermodal")
})
  
exports.postFolderCreate = [ 
  
  // body('name')
  // .custom((value, {req}) => {
  //   return prisma.folder.findFirst({
  //     where: {
  //       name: value
  //     }
  //   }).then(userDoc => {
  //     if(userDoc) {
  //       return Promise.reject('Folder Name Already Exist')
  //     }
  //   })
  // }),

  asyncHandler(async (req, res, next) => {
  const errors = validationResult(req)

  const user = req.user
  const folderName = req.body.name
  
  try {
    if(!errors.isEmpty()) {
      localStorage.setItem('openModal', 'open')
      res.render('index', {
        errors: errors.array(),
      })
    } else {
      const newFolder = await createFolder(folderName, user.id)
      res.status(201).json(newFolder)
    }
  } catch(error) {
    console.error('Error creating folder:', error);
    res.status(500).send('Error creating folder')
  }
})]

exports.getAllFolder = asyncHandler(async (req, res, next) => {
  try {
   
    const user = req.user
    const folders = await prisma.folder.findMany({
      where: {
        userId: user.id
      },
    })
    const currentFolderName = req.query.folder || folders[0]?.name || 'Root'

    const foldersWithActive = folders.map(folder => ({
      ...folder,
      active: folder.name === currentFolderName
    }));

    const currentFolder = foldersWithActive.find(f => f.active) || { name: currentFolderName, active: true };

    const files = await prisma.file.findMany({
      where: {
        folderId: currentFolder.id
      }
    })
    res.render('index', { 
      folders: foldersWithActive,
      files,
      currentFolder,
      user
    })
  } catch(error) {
    console.error('Erro fetching files:', error);
    res.status(500).json({ error: 'Error fetching file' })
  }
  
})

exports.getFolder = asyncHandler(async (req, res, next) => {
  const folderId = req.params.folderId
  try {
    const folder = await prisma.folder.findUnique({
      where: {
        id: folderId
      }
    })
 
    if(!folder) {
      return done(null, false, {message: "Folder does not exist"})
    }
    res.render('folder', {folder: folder})
  } catch(err) {
    return  
  }

})


exports.postFolderUpdate = asyncHandler(async (req, res, next) => {
  const folderId = req.params.folderId
  const user = req.user
  const folderName = req.body.name
  try {
    const uniqueName = await getUniqueFolderName(folderName, user.id)
    const folder = await prisma.folder.findUnique({
      where: {
        id: folderId
      }
    })
    if(folder.userId == userId) {
      await prisma.folder.update({
        where: {
          id: folderId,
        },
        data: {
          name: uniqueName,
        }
      })
      res.redirect(`folders/${folderId}`)
    }
  } catch(error) {
    console.error('Error renaming folder:', error);
    res.status(500).send('Error renaming folder')
  }
})

exports.getFolderDelete = asyncHandler(async (req, res, next) => {
  const folderId = req.params.folderId
  try {
    const folder = await prisma.folder.delete({
      where: {
        id: folderId
      }
    })
    res.send('folder Delete')
  } catch(err) {
    return done(err)
  }
  res.send("Get Delete Folder")
})

exports.postFolderDelete = asyncHandler(async (req, res, next) => {
  const folderId = req.params.folderId
  try {
    const folder = await prisma.folder.findUnique({
      where: {
        id: folderId
      }
    })
    if(folder.userId === req.user.id) {
      await prisma.folder.delete({
        where: {
          id: folderId
        }
      })
    }
    res.redirect('/')
  } catch(error) {
    res.status(500).json({ error: 'Internal Server Error'})
  }
})

async function getUniqueFolderName(desiredName, userId) {
  let name = desiredName;
  let counter = 1;
  let folderExists = await prisma.folder.findFirst({ where: { name, userId } });

  while (folderExists) {
    name = `${desiredName} (${counter})`;
    counter++;
    folderExists = await prisma.folder.findFirst({ where: { name } });
  }

  return name;
}