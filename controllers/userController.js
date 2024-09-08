const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcryptjs')
const { body, validationResult } = require("express-validator")
const asyncHandler = require('express-async-handler')

exports.postSignUp =  [
  body('username', 'User already Exist')
    .custom((value, {req}) => {
      return prisma.user.findFirst({
        where: {
          username: value
        }
      }).then(userDoc => {
        if(userDoc) {
          return Promise.reject('User already Exist')
        }
      })
    }),
  body('password', 'password must contain at least 5 character')
    .trim()
    .isLength({min: 5})
    .escape(),
  body('confirmPW', 'Passwords Do Not Match')
    .custom((value, {req}) => value === req.body.password).withMessage("The passwords do not match"),

  asyncHandler(async (req, res,next) => {
  const errors = validationResult(req)

  const username = req.body.username
  const password = req.body.password

  const encryptPW = await bcrypt.hash(password, 10)
  
  if(!errors.isEmpty()) {
    res.render("sign-up", {
      errors: errors.array(),
    });
    console.log(errors)
    return
  } else {
    await prisma.user.create({
      data: {
        username: username,
        password: encryptPW
  
      }
    })
    res.redirect('/')
  }
})]

exports.postLogIn = asyncHandler(async (username, password, done) => {
  try {
    const row = await prisma.user.findMany({
      where: {username: username}
    })
    const user = row[0]
    console.log(user[0])
    if (!user) {
      return done(null, false, { message: "Incorrect username" });
    }
    const match = await bcrypt.compare(password, user.password);
    console.log(match)
    if (!match) {
      // passwords do not match!
      console.log("does not match")
      return done(null, false, { message: "Incorrect password" })
    }
    return done(null, user);
  } catch(err) {
    return done(err);
  }
})

exports.deserializeUser = asyncHandler(async (id, done) => {
  try {
    const row = await prisma.user.findMany({
      where: { id: id }
    })
    const user = row[0]
    done(null, user);
  } catch(err) {
    done(err);
  }
})
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