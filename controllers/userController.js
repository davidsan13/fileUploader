const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const asyncHandler = require('express-async-handler')

exports.getFolderCreate = asyncHandler(async (req, res, next) => {
  res.send("Get Folder")
})
  
exports.postFolderCreate = asyncHandler(async (req, res, next) => {
  res.send("Post Folder")
})

exports.getAllFolder = asyncHandler(async (req, res, next) => {
  res.send("Get All Folder")
})

exports.getFolder = asyncHandler(async (req, res, next) => {
  res.send("Get A Folder")
})

exports.getFolderUpdate = asyncHandler(async (req, res, next) => {
  res.send("Get Update Folder")
})

exports.postFolderUpdate = asyncHandler(async (req, res, next) => {
  res.send("Post Update Folder")
})

exports.getFolderDelete= asyncHandler(async (req, res, next) => {
  res.send("Get Delete Folder")
})

exports.postFolderDelete= asyncHandler(async (req, res, next) => {
  res.send("Post Delete Folder")
})