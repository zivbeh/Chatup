const express = require('express');
const router = express.Router();
const db = require('../models');
const { Op, where } = require("sequelize");
const liveUpdate1 = require("../liveupdate").flash;
var flas = null;

router.get('/', async function(req, res, next) {
    if (!req.user){
        req.flash('error', 'To get ChatUp you Have to login First');
        res.redirect('/sessions');
    }

    const lobby = await db.ChatRoom.findAll({where:{ roomName: 'iceCream' }, include: [db.Message]});

    var room;
    var id = req.user.dataValues.id;
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

    res.render('ChatApp/app', { rooms: room, activeRoom: lobby, user: req.user, flash: flas  });//fix here the flash
    flas = null;
});

router.get('/NewRoom', function(req, res, next) {
    res.render('ChatApp/newroom', { user: req.user, error: req.flash('error') });
});

router.post('/newroom', async function(req, res, next) {
    const user = req.user;
    // if (req.body.roomName.length >= 25){
    //     req.flash('error', "RoomName must be in 25 Charcters");
    //     return res.redirect('/NewRoom');
    // }
    // if (req.body.Users != ''){
    //     req.flash('error', "You must feel the participants field!");
    //     return res.redirect('/NewRoom');
    // }
    const room = await db.ChatRoom.create({roomName: req.body.roomName});
    const array = req.body.Users.split(',');
    const users = await db.Users.findAll({where: {
        Email: array
    }});
    // if (!users || users === null){
    //     console.log(users);
    //     req.flash('error', "Some Users doesn;t exist!");
    //     return res.redirect('/NewRoom');
    // }
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
    await db.User_Rooms.destroy({ where: { ChatRoomId: 6 }})
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