const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcryptjs')
const { body, validationResult } = require("express-validator")
const asyncHandler = require('express-async-handler')

exports.getSignup = asyncHandler(async( req, res, next ) => {
  res.render('signup');
})

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

exports.getLogin = asyncHandler(async(req, res) => {
  res.render('login')
})

exports.postLogin = asyncHandler(async (username, password, done) => {
  try {
    const row = await prisma.user.findMany({
      where: {username: username}
    })
    const user = row[0]
    
    if (!user) {
      return done(null, false, { message: "Username does not exist" });
    }
    const match = await bcrypt.compare(password, user.password);
   
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

exports.getLogout = asyncHandler(async( req, res, next ) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
})

