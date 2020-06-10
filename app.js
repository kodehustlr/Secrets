//jshint esversion:6
require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
// const encrypt = require('mongoose-encryption');
// const md5 = require('md5');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const port = 4000;

const app = express();

// console.log(md5("123456"));

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/usersDB', {useNewUrlParser: true, useUnifiedTopology: true});
// Create a new users database
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

// ENCRYPTION: Make sure to add this plugin before you create model bc userSchema is used there
// const secret = "thisIsOurLittleSecret."; --> moved to .env and this should be deleted
// console.log(process.env.API_KEY);

// const secret = process.env.SECRET;
// userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });

const User = new mongoose.model('User', userSchema);

app.get('/', function(req, res) {
  res.render('home');
});

app.get('/login', function(req, res) {
  res.render('login');
});

app.get('/register', function(req, res) {
  res.render('register');
});

app.post('/register', function(req, res) {
  // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
  //   const newUser = new User({
  //     email: req.body.username,
  //     password: hash
  //   });
  // }); --> Angela's method
  const hash = bcrypt.hashSync(req.body.password, saltRounds);

  const newUser = new User({
    email: req.body.username,
    // password: md5(req.body.password)
    password: hash
  });

  newUser.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      res.render('secrets');
    }
  });
});

app.post('/login', function(req, res) {
  const enteredUsername = req.body.username;
  const enteredPassword = req.body.password;
  // const enteredPassword = md5(req.body.password);

  User.findOne({email: enteredUsername}, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        bcrypt.compare(enteredPassword, foundUser.password, function(err, result) {
          if (result === true) {
            res.render('secrets');
          }
        });

        // if (foundUser.password === enteredPassword) {
        //   // console.log(foundUser.password);
        //   res.render('secrets');
        // }
      }
    }
  })
});

app.listen(port, function() {
  console.log('Server successfully started on port http://localhost:' + port);
})
