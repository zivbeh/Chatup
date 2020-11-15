var express = require('express');
var router = express.Router();
const db = require('../models');
const User = db.Users;

/* GET users listing. */
router.get('/', async function(req, res, next) {
  res.render('users/new', { user: new User(), error: req.flash('error'), user: req.user});
});

router.post('/', async function(req, res, next) {
  console.log('Checking the email');

  if(req.body.Password.length<7 || req.body.Password.length>15){
    req.flash('error','Password must be between 7 to 15 chars');
    return res.redirect('/users');
  }
  if(!req.body.Password || req.body.Password === null || req.body.Password == undefined){
    req.flash('error','You have to feel the Password Field');
    return res.redirect('/users');
  }

  const userss1 = await User.findOne({ where: { Email: req.body.Email } });
  const userss10 = await User.findOne({ where: { Name: req.body.Name } });
  console.log(userss1);
  if(userss1 || userss10){
    req.flash('error', `Email or Name already exist`);
    return res.redirect('/users');
  }

  console.log(req.body, 'create new user');
  const user = await User.create(
    { Name: req.body.Name, Password: req.body.Password, Email: req.body.Email }
  );

  const wronguser = await User.findOne({ where: { Email: req.body.Email } });
  console.log(user, wronguser);

  //const wronguser = await User.findOne({ where: { Email: req.body.Email }});
  if(!wronguser || wronguser === null || wronguser == undefined){
    req.flash('error',`Wrong Email:  ${req.body.Email}`);
    return res.redirect('/users');
  }

  const re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
  if (re.test(user.dataValues.Email)){
    console.log('email checked and it is a valid one')
  } else {
    console.log('wrong email');
    await User.destroy({ where: { Email: req.body.Email } });
    console.log('destroyed', req.body.Email);
    req.flash('error',`No such Email:  ${req.body.Email}`);
    return res.redirect('/users');
  }

  console.log('1');
  try {
    console.log('inserting');
  } catch (err) {
    console.log(err);
    return res.render('users/new', { user, error: req.flash('error'), user: req.user});
  }
  console.log(user.dataValues.id);
  req.logIn(user.dataValues, async function(err) {
    await db.User_Rooms.create({
      UserId:wronguser.dataValues.id, ChatRoomId:1
    });
    console.log('logIn');
    console.log('inserted');
    //req.flash('success',`New User connected:  ${req.body.Name}`);
    return res.redirect('/');
  });
});

module.exports = router;
