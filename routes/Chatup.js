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

    const roon = await db.ChatRoom.findAll({ where: { Due: true, '$Users.id$': id },
        include: [{
            model: db.Users,
            required: false,
            through: {
                model: db.User_Rooms,
            }
        }]
    });

    //console.log('-----2-----', roon)
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
        if(user.dataValues.id === value0){
            console.log('-----1-----')
            name = await db.Contacts.findOne({ where: { RealUserId: value1, UserId: value0 } });
        } else {
            console.log('-----0-----')
            name = await db.Contacts.findOne({ where: { RealUserId: value0, UserId: value1 } });
        }
        //console.log('----111111111111111111111-----' , name, '----11111111111111111-----')
        //console.log(value0, value1, element.dataValues.roomName, idr, 'Li ---------------------- i_l')
        if (name === null){
            name = element.dataValues.roomName;
            diction[element.dataValues.roomName] = name;
        } else {
            diction[element.dataValues.roomName] = name.dataValues.userName;
        }
    }

    //console.log(diction, '-----dlskisdjfjsdndmbfsdbhsdjjhgjasbndamndahj-----')

    const roomArr = [];
    for (let index = 0; index < room.dataValues.ChatRooms.length; index++) {
        const element = room.dataValues.ChatRooms[index];
        if(diction.hasOwnProperty(`${element.dataValues.roomName}`)){
            roomArr.push(diction[element.dataValues.roomName]);
        } else {
            roomArr.push(element.dataValues.roomName);
        }
    }
    //console.log(roomArr)

    //console.log('-------------------------ds-------', flas) 
    
    if(room === []){
        return res.redirect('/Chatup/NewContact');
    }

    var dictionary = {};
    const array = await db.Contacts.findAll({ where: { UserId: user.dataValues.id } });
    for (let i = 0; i < array.length; i++){
        var value = array[i].dataValues;
        dictionary[value.RealUserId] = value.userName;
    }

    const messages = await db.ChatRoom.findOne({ where: { roomName: 'iceCream' }, include: [db.Message]}); // change this to be more usefull
    const m = messages.dataValues.Messages;
    var liMess = [];
    for (let c = 0; c < m.length; c++){
        var elm = m[c].dataValues;
        var userId = elm.UserId;
        var name = dictionary[userId];
        if (name === undefined){ // use the regular name
            const userr = await db.Users.findByPk(userId);
            name = userr.dataValues.Name;
        }
        liMess.push({ UserId: name, message: elm.message, id: userId });
    }
    //console.log(liMess)

    res.render('ChatApp/app', { rooms: roomArr, activeRoom: liMess, user: user, flash: flas  });//fix here the flash
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
    console.log('-----Check!!!-----')
    if (array.length === 1){
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
                    room = await db.ChatRoom.create({roomName: req.body.roomName, Due: true});
                }
            }
        } else {
            room = await db.ChatRoom.create({roomName: req.body.roomName, Due: true});
        }
    } else {
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
    flas = req.body.roomName;
    console.log(req.body.roomName,'------------------new-')
    res.redirect('/Chatup');
});




router.get('/Delete', async function(req, res, next) {
    // const room = await db.ChatRoom.findOne({ where: { id: 6 } });
    // console.log(room)
    //await db.Contacts.destroy({ where: { id: 2 }})
    await db.ChatRoom.destroy({ where: { id: 6 }})
    //await db.ChatRoom.destroy({ where: { id: 10 }})
    await db.User_Rooms.destroy({ where: { id: 3 }})
    await db.User_Rooms.destroy({ where: { id: 4 }})
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