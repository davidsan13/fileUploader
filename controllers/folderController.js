const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { body, validationResult } = require("express-validator")
const asyncHandler = require('express-async-handler')
var LocalStorage = require('node-localstorage').LocalStorage

localStorage = new LocalStorage('./scratch')

exports.getFolderCreate = asyncHandler(async (req, res, next) => {
  res.render("foldermodal")
})
  
exports.postFolderCreate = [ 
  
  // body('title')
  // .custom((value, {req}) => {
  //   return prisma.folder.findFirst({
  //     where: {
  //       title: value
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
  const title = req.body.title
  
  try {
    if(!errors.isEmpty()) {
      localStorage.setItem('openModal', 'open')
      res.render('index', {
        errors: errors.array(),
      })
    } else {
      await prisma.folder.create({
        data: {
          title: title,
          userId: user.id,
        }
      })
      res.redirect('/')
    }
  } catch(err) {
    return done(err)
  }
})]

exports.getAllFolder = asyncHandler(async (req, res, next) => {
  try {
   
    // if(!user) {
    //   res.render('index')
    // }
    const user = req.user
    const folders = await prisma.folder.findMany({
      where: {
        userId: user.id
      },
    })
    const currentFolder = req.query.folder || folders[0]?.title || 'Root'

    const files = await prisma.file.findMany({
      where: {
        folderId: folders.find(f => f.name === currentFolder)?.id
      }
    })
    res.render('index', { 
      folders,
      files,
      currentFolder,
      user
    })
  } catch(error) {
    console.log.error('Erro fetching files:', error);
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
  // const userId = req.user.id
  const title = req.body.title
  try {
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
          title: title,
        }
      })
      res.redirect(`folders/${folderId}`)
    }
  } catch(err) {
    return done(err)
  }
})

exports.getFolderDelete= asyncHandler(async (req, res, next) => {
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

exports.postFolderDelete= asyncHandler(async (req, res, next) => {
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