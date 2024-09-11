const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { body, validationResult } = require("express-validator")
const asyncHandler = require('express-async-handler')

exports.getFolderCreate = asyncHandler(async (req, res, next) => {
  res.render("foldermodal")
})
  
exports.postFolderCreate = [ 
  
  body('title')
  .custom((value, {req}) => {
    return prisma.folder.findFirst({
      where: {
        title: value
      }
    }).then(userDoc => {
      if(userDoc) {
        return Promise.reject('Folder Name Already Exist')
      }
    })
  }),

  asyncHandler(async (req, res, next) => {
  const errors = validationResult(req)

  const userId = req.user.id
  const title = req.body.title

  if(!errors.isEmpty()) {
    res.render('foldermodal', { 
      errors: errors.array(),
    })
  } else {
    await prisma.folder.create({
      data: {
        title: title,
        userId: userId,
      }
    })
    res.redirect('/')
  }
  
})]

exports.getAllFolder = asyncHandler(async (req, res, next) => {
  
  let user = req.user
  if(!user) {
    res.render('index')
  } else {
      user = user.id
      const allFolder = await prisma.folder.findMany({
        where: {
          userId: user
        },
      })
      res.render('index', {
        user: req.user,
        allFolder: allFolder 
      })
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
    console.log(req.user)
    if(!folder) {
      return done(null, false, {message: "Folder does not exist"})
    }
    console.log(folder)
    res.render('folder', {folder: folder})
  } catch(err) {
    return done(err)
  }

})

exports.getFolderUpdate = asyncHandler(async (req, res, next) => {
  res.send(req.params.folderId)
})

exports.postFolderUpdate = asyncHandler(async (req, res, next) => {
  const folderId = req.params.folderId
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
    console.log(req.user)
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