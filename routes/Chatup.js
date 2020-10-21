const express = require('express');
const router = express.Router();
const db = require('../models');
const { Op } = require("sequelize");
const liveUpdate1 = require("../liveupdate").flash;
var flas = null;

router.get('/', async function(req, res, next) {
    const user = req.user;
    if (!user){
        req.flash('error', 'To get ChatUp you Have to login First');
        res.redirect('/sessions');
    }

    //const lobby = await db.ChatRoom.findAll({where:{ roomName: 'iceCream' }, include: [db.Message]});

    var room;
    var id = user.dataValues.id;
    if(flas!=null){
        console.log('a')
        liveUpdate1(flas);
        room = await db.Users.findOne({ where: { id: id, '$ChatRooms.roomName$': { [Op.ne]: flas } },  // use Op [Op.ne]: flas
        include: [{
            model: db.ChatRoom,
            required: false,
            through: {
            model: db.User_Rooms,
            }
        }]
        });
    } else {
        room = await db.Users.findOne({ where: { id: id },  // use Op [Op.ne]: flas
        include: [{
            model: db.ChatRoom,
            required: false,
            through: {
            model: db.User_Rooms,
            }
        }]
        });
    }

    console.log('-------------------------ds-------', flas) /// work here!

    if(room === []){
        return res.redirect('/Chatup/NewContact');
    }

    var dictionary = {};
    const array = await db.Contacts.findAll({ where: { UserId: user.dataValues.id } });
    for (let i = 0; i < array.length; i++){
        var value = array[i].dataValues;
        dictionary[value.RealUserId] = value.userName;
    }
    console.log(dictionary, array)

    const messages = await db.ChatRoom.findOne({ where: { roomName: 'iceCream' }, include: [db.Message]});
    console.log(messages)
    const m = messages.dataValues.Messages;
    console.log(m)
    var liMess = [];
    for (let c = 0; c < m.length; c++){
        var elm = m[c].dataValues;
        var userId = elm.UserId;
        var name = dictionary[userId];
        if (name === undefined){ // use the regular name
            const userr = await db.Users.findByPk(userId);
            //console.log(userr)
            name = userr.dataValues.Name;
        }
        liMess.push({ UserId: name, message: elm.message, id: userId });
        console.log(name)
    }
    console.log(liMess)

    res.render('ChatApp/app', { rooms: room, activeRoom: liMess, user: user, flash: flas  });//fix here the flash
    flas = null;
});

router.get('/NewRoom', function(req, res, next) {
    res.render('ChatApp/newroom', { user: req.user, error: req.flash('error') });
});

router.get('/NewContact', function(req, res, next) {
    res.render('ChatApp/NewContact', { user: req.user, error: req.flash('error') });
});

router.post('/newcontact', async function(req, res, next) {
    const user = req.user;
    const changeuser = req.body.Users;
    const checkEmail = await db.Users.findOne({ where: { Email: changeuser }});
    if(checkEmail === null){
        req.flash('error', 'user Email is invalid');
        return res.redirect('/Chatup/NewContact');
    }
    console.log(changeuser, checkEmail)
    const contactEmail = await db.Contacts.findOne({ where: { RealUserId: checkEmail.dataValues.id }});
    if (contactEmail){
        contactEmail.userName = req.body.ContactName;
        contactEmail.save();
        console.log(contactEmail)
    } else {
        await db.Contacts.create({
            UserId: user.dataValues.id, userName: req.body.ContactName, RealUserId: checkEmail.dataValues.id
        });
    }

    res.redirect('/Chatup');
});

router.post('/newroom', async function(req, res, next) {
    const user = req.user;
    const room = await db.ChatRoom.create({roomName: req.body.roomName});
    const array = req.body.Users.split(',');
    const users = await db.Users.findAll({where: {
        Email: array
    }});
    const arr = [];
    console.log(users,'-------------------NewRoomCreated----------------------');
    for (let i = 0; i < users.length; i++) {
        const useron = users[i];
        const a = await useron.addChatRoom(room, { through: {} });
        arr.push(a);
        console.log('work');
    }
    const a = await user.addChatRoom(room, { through: {} });
    flas = req.body.roomName;
    console.log(req.body.roomName,'------------------new-')
    res.redirect('/Chatup');
});




router.get('/Delete', async function(req, res, next) {
    // const room = await db.ChatRoom.findOne({ where: { id: 6 } });
    // console.log(room)
    //await db.Contacts.destroy({ where: { id: 2 }})
    await db.Contacts.destroy({ where: { id: 3 }})
    await db.Contacts.destroy({ where: { id: 4 }})
    await db.Contacts.destroy({ where: { id: 5 }})
    //await room.destroy();
    //await users.destroy();
    res.send('all messages deleted!');
});

router.post('/Message', async function(req, res, next) {
    await db.User_Rooms.create({
        UserId:1, ChatRoomId:1
    });
    await db.User_Rooms.create({
        UserId:2, ChatRoomId:12
    });
    res.send('all` messages deleted!');
});

router.get('/all', async function(req, res, next) {
    //const room = await db.ChatRoom.findAll();
    const room = await db.Users.findOne({ where: { id: 1, '$ChatRooms.roomName$': { [Op.ne]: 'iceCream' } },  // use Op [Op.ne]: flas
        include: [{
            model: db.ChatRoom,
            required: false,
            through: {
            model: db.User_Rooms,
            }
            // where: {
            //     roomName: { [Op.ne]: flas }
            // }
        }]
    });
    res.send(room);
});

module.exports = router;