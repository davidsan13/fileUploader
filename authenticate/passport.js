const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcryptjs')

 
// remove when db install
var dummie ={id: 1, username: 'kev', password: 'united24'}

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      // Update with PRISMA ORM
      /* ******************************************************** */
      const user = dummie;
      // const user = rows[0];
      console.log(user)
      if (!user) {
        
        return done(null, false, { message: "Incorrect username" });
      }
      // const match = await bcrypt.compare(password, user.password);
      if (user.password !== password) {
        // passwords do not match!
        console.log("does not match")
        return done(null, false, { message: "Incorrect password" })
      }
      return done(null, user);
    } catch(err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    // update when db install
    // const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    // const user = rows[0];
    const user = dummie
    done(null, user);
  } catch(err) {
    done(err);
  }
});

module.exports = passport