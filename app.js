//jshint esversion:6
require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const port = 4000;
// const encrypt = require('mongoose-encryption');
// const md5 = require('md5');
// const bcrypt = require('bcrypt');
// const saltRounds = 10;
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
// you dont need to require passport-local because it's passport-local-mongoose's dependencies

const app = express();

// console.log(md5("123456"));

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

// 1) Initialize session
app.use(session({
  secret: 'Our little secret key.',
  resave: false,
  saveUninitialized: false
}));
// 2) Initialize passport to manage session
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/usersDB', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);
// Create a new users database
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});
// 3) Add passport local mongoose plugin to userSchema
userSchema.plugin(passportLocalMongoose);

// ENCRYPTION: Make sure to add this plugin before you create model bc userSchema is used there
// const secret = "thisIsOurLittleSecret."; --> moved to .env and this should be deleted
// console.log(process.env.API_KEY);

// const secret = process.env.SECRET;
// userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });

const User = new mongoose.model('User', userSchema);

// Passport-Local Configuration
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', function(req, res) {
  res.render('home');
});

app.get('/login', function(req, res) {
  res.render('login');
});

app.get('/register', function(req, res) {
  res.render('register');
});

app.get('/secrets', function(req, res) {
  // check if a user is authenticated (already logined)
  if (req.isAuthenticated()) {
    res.render('secrets');
  } else {
    res.redirect('/login');
  }
});

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

app.post('/register', function(req, res) {
  // we will use passportLocalMongoose to do this
  User.register({username: req.body.username}, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect('/register');
    } else {
      // authenticate and set login session
      passport.authenticate('local')(req, res, function() {
        res.redirect('/secrets');
      });
    }
  });

  // -----------------------------------------------------------------------**
  // // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
  // //   const newUser = new User({
  // //     email: req.body.username,
  // //     password: hash
  // //   });
  // // }); --> Angela's method
  // const hash = bcrypt.hashSync(req.body.password, saltRounds);
  //
  // const newUser = new User({
  //   email: req.body.username,
  //   // password: md5(req.body.password)
  //   password: hash
  // });
  //
  // newUser.save(function(err) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     res.render('secrets');
  //   }
  // });
});

app.post('/login', function(req, res) {
  // Create a new user
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
    // User passport to login and authenticate the user
  req.login(user, function(err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate('local')(req, res, function() {
        res.redirect('/secrets');
      });
    }
  });

  // -----------------------------------------------------------------------**
  // const enteredUsername = req.body.username;
  // const enteredPassword = req.body.password;
  // // const enteredPassword = md5(req.body.password);
  //
  // User.findOne({email: enteredUsername}, function(err, foundUser) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     if (foundUser) {
  //       bcrypt.compare(enteredPassword, foundUser.password, function(err, result) {
  //         if (result === true) {
  //           res.render('secrets');
  //         }
  //       });
  //
  //       // if (foundUser.password === enteredPassword) {
  //       //   // console.log(foundUser.password);
  //       //   res.render('secrets');
  //       // }
  //     }
  //   }
  // })
});

app.listen(port, function() {
  console.log('Server successfully started on port http://localhost:' + port);
})
