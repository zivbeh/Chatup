const express = require('express');
const router = express.Router();
const db = require('../models');
const { Op } = require("sequelize");
const liveUpdate1 = require("../liveupdate").flash;

router.get('/', async function(req, res, next) {
    if (!req.user){
        req.flash('error', 'To get ChatUp you Have to login First');
        res.redirect('/sessions');
    }

    if(req.flash('success') != ''){
        liveUpdate1(req.flash('success'));
    }

    const room = await db.Users.findOne({ where: { id: req.user.dataValues.id }, 
        include: [{
            model: db.ChatRoom,
            required: false,
            through: {
            model: db.User_Rooms,
            }
        }]
    });

    const lobby = await db.ChatRoom.findAll({where:{ roomName: 'iceCream' }, include: [db.Message]});

    res.render('ChatApp/app', { rooms: room, activeRoom: lobby, user: req.user, flash: req.flash('success')  });
});

router.get('/NewRoom', function(req, res, next) {
    res.render('ChatApp/newroom', { user: req.user, error: req.flash('error') });
});

router.post('/newroom', async function(req, res, next) {
    const user = req.user;
    const room = await db.ChatRoom.create({roomName: req.body.roomName});
    const array = req.body.Users.split(',');
    const users = await db.Users.findAll({where: {
        Email: array
    }});
    const arr = [];
    console.log(room,'-------------------NewRoomCreated----------------------');
    for (let i = 0; i < users.length; i++) {
        const useron = users[i];
        const a = await useron.addChatRoom(room, { through: {} });
        arr.push(a);
        console.log('work');
    }
    const a = await user.addChatRoom(room, { through: {} });
    req.flash('success', `${room.dataValues.roomName}`);
    res.redirect('/Chatup');
});

router.get('/Delete', async function(req, res, next) {
    await db.Message.destroy({ where: { id: 116 } }, {}); /// remember to change db.Message
    await db.Message.destroy({ where: { id: 113 } }, {});
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
    const array = ['zivbeh@gmail.com', 'abehar@gmail.com'];

    const users = await db.Users.findAll({where: {
        Email: array
    }}).then(room => res.send(room));
});

module.exports = router;