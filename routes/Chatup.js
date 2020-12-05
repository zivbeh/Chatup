const express = require('express');
const router = express.Router();
const db = require('../models');
const { Op } = require("sequelize");
const liveUpdate1 = require("../liveupdate").flash;
var flas = null;

async function roomi(id){
    var roomg = await db.Users.findOne({ where: { id: id },
        include: [{
            model: db.ChatRoom,
            required: false,
            through: {
            model: db.User_Rooms,
            }
        }]
    });
    return roomg;
}

async function doomi(id, flasi){
    if(flasi!=null){
        liveUpdate1(flasi);
        var doom = await db.Users.findOne({ where: { id: id, '$ChatRooms.id$': { [Op.ne]: flasi } },  // use Op [Op.ne]: flas
        include: [{
            model: db.ChatRoom,
            required: false,
            through: {
            model: db.User_Rooms,
            }
        }]
        });
    } else {
        doom = await roomi(id);
    }
    return doom;
}

function roomArri(diction, room){
    var roomArr = [];
    for (let index = 0; index < room.dataValues.ChatRooms.length; index++) {
        const element = room.dataValues.ChatRooms[index];
        if(diction.hasOwnProperty(`${element.dataValues.id}`)){
            roomArr.push(diction[element.dataValues.id]);
        } else {
            roomArr.push(element.dataValues.roomName);
        }
    }
    return roomArr;
}

router.get('/', async function(req, res, next) {
    const user = req.user;
    if (!user){
        req.flash('error', 'To get ChatUp you Have to login First');
        res.redirect('/sessions');
    }

    var room;
    var id = user.dataValues.id;
    room = await doomi(id, flas);

    const roon = await db.ChatRoom.findAll({ where: { Due: true, '$Users.id$': id },
        include: [{
            model: db.Users,
            required: false,
            through: {
                model: db.User_Rooms,
            }
        }]
    });

    var diction = {};
    for (let index = 0; index < roon.length; index++) {
        const element = roon[index];
        const idr = element.dataValues.id;
        const li = await db.ChatRoom.findOne({ where: { id: idr }, 
            include: [{
                model: db.Users,
                required: false,
                through: {
                    model: db.User_Rooms,
                }
            }]
        });
        var value0 = li.dataValues.Users[0].dataValues.id;
        var value1 = li.dataValues.Users[1].dataValues.id; // gets only 1 fix!!!
        var name;
        var idn;
        if(user.dataValues.id === value0){
            console.log('-----1-----')
            name = await db.Contacts.findOne({ where: { RealUserId: value1, UserId: value0 } });
            idn=value1;
        } else {
            console.log('-----0-----')
            name = await db.Contacts.findOne({ where: { RealUserId: value0, UserId: value1 } });
            idn=value0;
        }

        console.log(name)
        if (name == null){
            const namit = await db.Users.findByPk(idn);
            name = namit.dataValues.Name;
            diction[element.dataValues.id] = name;
        } else {
            diction[element.dataValues.id] = name.dataValues.userName;
        }
    }
    console.log(diction,'dictonmsdaad')

    var roomArr;
    var snitchel;
    if(flas!=null && room == null){
        console.log('Nothing, First Room')
        snitchel = null;
    } else if (room == null) {
        room = await doomi(id, null);
        
        roomArr = roomArri(diction, room);
        snitchel = 1;
    } else {
        roomArr = roomArri(diction, room);
        snitchel = 1;
    }
    console.log('39999999', flas, roomArr, snitchel, room)

    if(room === []){
        return res.redirect('/Chatup/NewContact');
    }

    // var dictionary = {};
    // const array = await db.Contacts.findAll({ where: { UserId: user.dataValues.id } });
    // for (let i = 0; i < array.length; i++){
    //     var value = array[i].dataValues;
    //     dictionary[value.RealUserId] = value.userName;
    // }

    // const messages = await db.ChatRoom.findOne({ where: { id: 1 }, include: [db.Message]}); // change this to be more usefull
    // const m = messages.dataValues.Messages;
    // var liMess = [];
    // for (let c = 0; c < m.length; c++){
    //     var elm = m[c].dataValues;
    //     var userId = elm.UserId;
    //     var name = dictionary[userId];
    //     if (name === undefined){ // use the regular name
    //         const userr = await db.Users.findByPk(userId);
    //         name = userr.dataValues.Name;
    //     }
    //     liMess.push({ UserId: name, message: elm.message, id: userId });
    // }

    res.render('ChatApp/app', { rooms: roomArr, user: user, snitchel: snitchel });
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
    console.log(changeuser, checkEmail, '-----------dsa')
    const contactEmail = await db.Contacts.findOne({ where: { RealUserId: checkEmail.dataValues.id, UserId: user.dataValues.id }});
    if (contactEmail){
        contactEmail.userName = req.body.ContactName;
        contactEmail.save();
        console.log(contactEmail)
    } else {
        await db.Contacts.create({
            UserId: user.dataValues.id, userName: req.body.ContactName, RealUserId: checkEmail.dataValues.id
        });
    }
    console.log('-------------------------------=====-----------------------------')

    // if only 1 user was written get the contact name to be the roomName

    res.redirect('/Chatup');
});

router.post('/newroom', async function(req, res, next) {
    const user = req.user;
    const array = req.body.Users.split(',');
    const users = await db.Users.findAll({where: {
        Email: array
    }}); // check if already have a room with this contact!!!
    var room;
    console.log(users)
    console.log('-----Check!!!-----')
    const TF = array.find(element => element === user.dataValues.Email);
    if(TF){
        req.flash('error', "you can't write your email in field");
        return res.redirect('/Chatup/NewRoom');
    }
    if (users.length === 1){
        console.log('-----Check!!!1-----')
        const roon = await db.ChatRoom.findAll({ where: { Due: true, '$Users.id$': user.dataValues.id },
            include: [{
                model: db.Users,
                required: false,
                through: {
                    model: db.User_Rooms,
                }
            }]
        });
        console.log(roon.length)
        if (roon.length != 0){
            console.log('Choke')
            for (let index = 0; index < roon.length; index++) {
                const element = roon[index];
                const idr = element.dataValues.id;
                const li = await db.ChatRoom.findOne({ where: { id: idr }, 
                    include: [{
                        model: db.Users,
                        required: false,
                        through: {
                            model: db.User_Rooms,
                        }
                    }]
                });
                console.log(li.dataValues.Users, '000000000000000000000000000000000')
                var value0 = li.dataValues.Users[0].dataValues.id;
                var value1 = li.dataValues.Users[1].dataValues.id; // gets only 1 fix!!!
                if(user.dataValues.id === value0 && users[0].dataValues.id === value1 || user.dataValues.id === value1 && users[0].dataValues.id === value0){
                    console.log('-----1-----')
                    req.flash('error', 'Already have a room with this friend');
                    return res.redirect('/Chatup/NewContact');
                } else {
                    console.log('-----2-----')
                    //room = await db.ChatRoom.create({roomName: req.body.roomName, Due: true});
                }
            }
            console.log('notcheck')
            room = await db.ChatRoom.create({roomName: req.body.roomName, Due: true});
        } else {
            console.log('problem')
            room = await db.ChatRoom.create({roomName: req.body.roomName, Due: true});
        }
    } else {
        console.log('big notcheck')
        room = await db.ChatRoom.create({roomName: req.body.roomName});
    }
        
    const arr = [];
    console.log('-------------------NewRoomCreated----------------------');
    for (let i = 0; i < users.length; i++) {
        const useron = users[i];
        const a = await useron.addChatRoom(room, { through: {} });
        arr.push(a);
        console.log('work');
    }
    const a = await user.addChatRoom(room, { through: {} });
    flas = room.dataValues.id;
    console.log(flas,'------------------new-')
    res.redirect('/Chatup');
});


router.get('/Delete', async function(req, res, next) {
    await db.ChatRoom.destroy({ where: { id: 5 }});
    await db.User_Rooms.destroy({ where: { id: 10 }});
    await db.User_Rooms.destroy({ where: { id: 9 }});
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
    const user = req.user;
    console.log(user)
    const roon = await db.ChatRoom.findAll({ where: { Due: true, '$Users.id$': user.dataValues.id },
        include: [{
            model: db.Users,
            required: false,
            through: {
                model: db.User_Rooms,
            }
        }]
    });

    console.log('-----2-----', roon)
    var diction = {};
    for (let index = 0; index < roon.length; index++) {
        const element = roon[index];
        const id = element.dataValues.id;
        const li = await db.ChatRoom.findOne({ where: { id: id }, 
            include: [{
                model: db.Users,
                required: false,
                through: {
                    model: db.User_Rooms,
                }
            }]
        });
        console.log(element, li)
        var value0 = li.dataValues.Users[0].dataValues.id;
        var value1 = li.dataValues.Users[1].dataValues.id; // gets only 1 fix!!!
        var name;
        if(user.dataValues.id === value0){
            console.log('-----1-----')
            name = await db.Contacts.findOne({ where: { RealUserId: value1, UserId: value0 } });
        } else {
            console.log('-----0-----')
            name = await db.Contacts.findOne({ where: { RealUserId: value0, UserId: value1 } });
        }
        console.log(name, value0, value1)
        diction[element.dataValues.roomName] = name.dataValues.userName;
    }

    console.log(roon, contactsArray, diction, '-----dlskisdjfjsdndmbfsdbhsdjjhgjasbndamndahj-----')
    // const room = await db.Users.findOne({ where: { id: 1, '$ChatRooms.roomName$': { [Op.ne]: 'iceCream' } },  // use Op [Op.ne]: flas
    //     include: [{
    //         model: db.ChatRoom,
    //         required: false,
    //         through: {
    //         model: db.User_Rooms,
    //         }
    //         // where: {
    //         //     roomName: { [Op.ne]: flas }
    //         // }
    //     }]
    // });
    res.send(diction);
});

module.exports = router;