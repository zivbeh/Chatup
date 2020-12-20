var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.Users;
const mailer = require('../emailer');
var async = require('async');
var crypto = require('crypto');

router.get('/', function(req, res, next) {
  var x;
  if (req.user){
    x = req.user.dataValues.Name;
    console.log(x)
  }
  else {
    x = null;
  }
  res.render('index', { title: 'Express', user1: x, user: req.user });
});

router.get('/token', function(req, res, next) {
  res.render('token', { token: null, user: req.user });
});

router.get('/forgotPassword', function(req, res, next) {
  res.render('forgotPassword', { error: req.flash('error'), user: req.user});
});

router.post('/forgotPassword', function(req, res, next) {
  if(!req.body.Email){
    req.flash('error', 'you have to enter a valid email!');
    res.redirect('/forgotPassword');
  }
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    async function(token, done) {
      const user = await User.findOne({ where: { Email: req.body.Email } });
      if (!user || user === null) {
        req.flash('error', 'No account with that email address exists.');
        return res.redirect('/forgotPassword');
      }

      await user.update({
        resetPasswordToken: token,
        resetPasswordExpires: Date.now() + 3600000
      })

      mailer.sender(user.Email, 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
      'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
      'http://' + req.headers.host + '/reset/' + token + '\n\n' +
      'If you did not request this, please ignore this email and your password will remain unchanged.\n', 'reseting your Password');
      res.send(`Check out your Gmail`);
    }
  ]),
  function(err) {
    if (err) return next(err);
    console.log('redirecting')
    res.redirect('/forgotPassword');
  };
});
  

router.get('/reset/:token', async function(req, res) {
  console.log(`token:   ${req.params.token}`)
  console.log(`date:   ${Date.now()}`)

  const user1 = await db.sequelize.query('SELECT "id" FROM "Users" WHERE "resetPasswordToken" = (:token) AND "resetPasswordExpires" > (:date)', {
    model: db.Users,
    replacements: {date: Date.now(), token: req.params.token},
    type: db.sequelize.QueryTypes.SELECT,
    mapToModel: true
  });

  console.log('Here is the userID:    ', user1);

  const user = await User.findByPk(user1[0].dataValues.id);
  console.log('Here is the user:    ', user);

  if (!user) {
    req.flash('error', 'Password reset token is invalid or has expired.');
    return res.redirect('/forgotPassword');
  }
  res.render('reset', {
    user: req.user,
    error: req.flash('error')
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    async function(done) {
      const user1 = await db.sequelize.query('SELECT "id" FROM "Users" WHERE "resetPasswordToken" = (:token) AND "resetPasswordExpires" > (:date)', {
        model: db.Users,
        replacements: {date: Date.now(), token: req.params.token},
        type: db.sequelize.QueryTypes.SELECT,
        mapToModel: true
      });
    
      console.log('Here is the userID:    ', user1[0].dataValues.id);
    
      const user = await User.findByPk(user1[0].dataValues.id);
      console.log('Here is the user:    ', user);


      if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('back');
      }

      console.log('Here is the user!!!:    ', user);

      await user.update({
        Password: req.body.Password,
        resetPasswordToken: null,
        resetPasswordExpires: null
      })

      req.logIn(user, function(err) {
        console.log('Log in the User:    ', user.Name);
        done(err, user);
      });

      mailer.sender(user.Email, 'Hello,\n\n' + 'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n', 'Your password has been changed');
    }
  ], function(err) {
    res.redirect('/');
  });
});

router.post('/token', function(req, res, next) {
  if (req.user) {
    const token = jwt.sign(
      { id: req.user.id },
      'secret123',
      { expiresIn: '7d' }
    );
    res.render('token', { token });
  }
});

module.exports = router;
