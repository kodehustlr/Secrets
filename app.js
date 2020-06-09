//jshint esversion:6
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const port = 4000;

const app = express();

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
const secret = "thisIsOurLittleSecret.";
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });

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
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
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

  User.findOne({email: enteredUsername}, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.password === enteredPassword) {
          // console.log(foundUser.password);
          res.render('secrets');
        }
      }
    }
  })
});

app.listen(port, function() {
  console.log('Server successfully started on port http://localhost:' + port);
})
