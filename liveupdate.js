const db = require('./models');
const socketio = require('socket.io');
const session = require('cookie-session')({
    name: 'session',
    secret: 'ninja',
    saveUninitialized: false,
    cookie: { secure: false },
});
var flas = 'iceCream';
function flash(flash){
    console.log(flash,'--------------------123456z-----------------------');
    flas = flash;
}

function init(server) {
    const io = socketio(server);
    init.io = io;

    io.on('connection', async socket => {
        let cookieString = socket.request.headers.cookie;

        let req = { connection: { encrypted: false }, headers: { cookie: cookieString } };
        let res = { getHeader: () => { }, setHeader: () => { } };
        console.log(socket.id,'----------------------d---------------------------')

        const lobby  = await db.ChatRoom.findAll({where:{ roomName: 'iceCream' }, include: [{
            model: db.Users,
            required: false,
            through: {
              model: db.User_Rooms,
            }
        }, db.Message]});

        var diction = {};
        async function resetDictionary(){
            diction = {};
            roon = await db.ChatRoom.findAll({ where: { Due: true, '$Users.id$': socket.data.user.dataValues.id },
                include: [{
                    model: db.Users,
                    required: false,
                    through: {
                        model: db.User_Rooms,
                    }
                }]
            });
            console.log(roon, '-----------------------------------12345678878')

            for (let index = 0; index < roon.length; index++) {
                const element = roon[index];
                const i = element.dataValues.id;
                console.log(i)
                const li = await db.ChatRoom.findOne({ where: { id: i }, 
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
                if(socket.data.user.dataValues.id === value0){
                    name = await db.Contacts.findOne({ where: { RealUserId: value1, UserId: value0 } });
                } else {
                    name = await db.Contacts.findOne({ where: { RealUserId: value0, UserId: value1 } });
                }
                if (name === null){
                    name = element.dataValues.roomName;
                    diction[element.dataValues.roomName] = name;
                    console.log(name, '-----------------------------------123')
                } else {
                    diction[element.dataValues.roomName] = name.dataValues.userName;
                    console.log(name.dataValues.userName, '-----------------------------------123')
                }
            }
            console.log(diction)
            return diction;
        }

        var ctionary = {};
        async function resetIdLidictionary(iid){
            ctionary = {};
            const allRoms = await db.Users.findOne({ where: { id: iid },  // use Op [Op.ne]: flas
            include: [{
                model: db.ChatRoom,
                required: false,
                through: {
                model: db.User_Rooms,
                }
            }]
            });

            ctionary = {};
            for (let index = 0; index < allRoms.dataValues.ChatRooms.length; index++) {
                const element = allRoms.dataValues.ChatRooms[index];
                ctionary[element.dataValues.id] = index;
            }
            console.log(ctionary);
            return ctionary;
        }

        session(req, res,  async () => {
            if (req.session && req.session.passport && req.session.passport.user) {
                const user = await db.Users.findByPk(req.session.passport.user, function(err, user) {
                    if (err) return socket.disconnect();
                });

                socket.data = { user: user, activeRoom: lobby };
                io.to(socket.data.activeRoom[0].dataValues.roomName).emit('message', { from: 'Server', text: `User Joined: ${user.Name}`});
                
                const diction = await resetDictionary();
                const cc = await resetIdLidictionary(socket.data.user.dataValues.id);
            } else {
                socket.data = { user: 'Unknown', activeRoom: lobby };
                socket.disconnect();
            }
        });

        socket.join('iceCream');

        if(flas != 'iceCream'){
            const room = await db.ChatRoom.findAll({where:{ roomName: flas }, include: [{
                model: db.Users,
                required: false,
                through: {
                  model: db.User_Rooms,
                }
              }, db.Message]});
            if(room===[]){
                console.log('problem');
            } else {
                const Contacts = await db.User_Rooms.findAll({where:{ ChatRoomId: room[0].dataValues.id }});
                if(Contacts.length === 2){
                    const element = room[0];
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

                    var value0 = li.dataValues.Users[0].dataValues.id;
                    var value1 = li.dataValues.Users[1].dataValues.id;
                    var name;
                    var connectedClients = Object.keys(io.clients().connected);
                    const dict = {};
                    for (var key in connectedClients) {
                        const d = connectedClients[key];
                        const us = io.sockets.connected[d];
                        const idr = us.data.user.dataValues.id;
                        dict[d] = idr;
                    }
                    var OtherUser;
                    if(socket.data.user.dataValues.id === value0){
                        OtherUser = Object.keys(dict).find(key => dict[key] === value1);
                    } else {
                        OtherUser = Object.keys(dict).find(key => dict[key] === value0);
                    }
                    if(OtherUser != undefined){
                        //check how he call your user by id
                        var name1 = await db.Contacts.findOne({ where: { RealUserId: socket.data.user.dataValues.id, UserId: dict[OtherUser] } });
                        var name2 = await db.Contacts.findOne({ where: { RealUserId: dict[OtherUser], UserId: socket.data.user.dataValues.id } });
                        if (name1 === null){
                            name = element.dataValues.roomName;
                            //diction[element.dataValues.roomName] = name;
                            io.to(socketid).emit('createRoom', name);
                        } else {
                            //diction[element.dataValues.roomName] = name.dataValues.userName;
                            io.to(OtherUser).emit('createRoom', name1.dataValues.userName);
                        }
                        if (name2 === null){
                            name = element.dataValues.roomName;
                            //diction[element.dataValues.roomName] = name;
                            io.to(socketid).emit('createRoom', name);
                        } else {
                            //diction[element.dataValues.roomName] = name.dataValues.userName;
                            io.to(socket.id).emit('createRoom', name2.dataValues.userName);
                        }
                    } else {
                        io.emit('createRoom', flas);
                    }
                } else {
                    io.emit('createRoom', flas);
                }

                socket.leave(socket.data.activeRoom[0].dataValues.roomName);
                socket.data.activeRoom = room;
                socket.join(room[0].dataValues.roomName);
                io.to(room[0].dataValues.roomName).emit('message', { text: `Room: ${room[0].dataValues.roomName} has been created`, from: 'Server'});
                io.to(room[0].dataValues.roomName).emit('message', { text: `${socket.data.user.dataValues.Name} has joined to: ${room[0].dataValues.roomName} by ${socket.data.user.dataValues.Name}`, from: 'Server'});
            }
            flas = 'iceCream';
        }
        

        socket.on('deleteRoom', async function(Name) { // work here if there is 2 users emit twise with diffrent names  
            //const dici =  await resetDictionary();
            const dc =  await resetIdLidictionary(socket.data.user.dataValues.id);
            var c;
            for (key in dc) {
                console.log(key, dc[key], Name)
                var k = dc[key];
                if(k==Name){
                    console.log('aaa')
                    c = key;
                    console.log('aaa')
                }
            }
            console.log(c, Name, dc)
            const roo = await db.ChatRoom.findOne({ where: {id: c}, include: [{
                model: db.Users,
                required: false,
                through: {
                    model: db.User_Rooms,
                }
            }] });
            console.log(roo)
            // var a;
            // a = Object.keys(dici).find(key => dici[key] === roo.dataValues.roomName);
            // console.log(a, '-----------------------')
            // if (a != undefined){
            //     console.log('NewRoomOwn----------------------')
            // } else {
            //     a = roo.dataValues.id;
            // }

            if(roo.dataValues.Users.length == 2){

                var value0 = roo.dataValues.Users[0].dataValues.id;
                var value1 = roo.dataValues.Users[1].dataValues.id;
                var connectedClients = Object.keys(io.clients().connected);
                const dict = {};
                for (var key in connectedClients) {
                    const d = connectedClients[key];
                    const us = io.sockets.connected[d];
                    const idr = us.data.user.dataValues.id;
                    dict[d] = idr;
                }
                console.log(dict)
                var OtherUser;
                //if(socket.data.user.dataValues.id === value0){
                    OtherUser = Object.keys(dict).find(key => dict[key] === value1);
                    console.log(OtherUser,'------123')
                    var dd = await resetIdLidictionary(value1);
                    console.log(dd,'------123')
                    var realName = Object.keys(dd).find(key => dd[key] === value1);
                    console.log(realName,dd[realName],'------123')
                    io.to(OtherUser).emit('deleteRoom', dd[realName]+1);
                //} else {
                    OtherUser = Object.keys(dict).find(key => dict[key] === value0);
                    console.log(OtherUser,'------1234')
                    dd = await resetIdLidictionary(value0);
                    console.log(dd,'------1234')
                    realName = Object.keys(dd).find(key => dd[key] === value0);
                    console.log(realName,dd[realName],'------1234')
                    io.to(OtherUser).emit('deleteRoom', dd[realName]+1);
                //}

                //await db.User_Rooms.destroy({ where: { ChatRoomId: roo.dataValues.id }});

                // await roo.destroy();
                // io.emit('deleteRoom', Name);
            } else {
                //await db.User_Rooms.destroy({ where: { ChatRoomId: roo.dataValues.id, UserId: socket.data.user.dataValues.id }});
                io.to(socket.id).emit('deleteRoom', Name);
            }
        });

        socket.on('message', async function(text, id) {
            const from = socket.data.user;
            const room = socket.data.activeRoom[0];// use this users and sent to each of them diffrent message
            const x = from.dataValues.Name;
            console.log(socket.data.activeRoom[0].dataValues.roomName)
            const users = io.sockets.adapter.rooms[socket.data.activeRoom[0].dataValues.roomName];
            const arr = [];
            for (var key in users.sockets) {
                if (users.sockets.hasOwnProperty(key)) {
                    arr.push(key);
                }
            }
            for (var b in arr){
                const socketid = arr[b];
                const us = io.sockets.connected[socketid];
                //see how this user call the message user and then emit to his socket id the message
                const n = await db.Contacts.findOne({where: { RealUserId: from.dataValues.id, UserId: us.data.user.dataValues.id } });
                console.log(n)
                if (n!=null){
                    const frm = n.dataValues.userName;
                    io.to(socketid).emit('message', { text: text, from: frm, id: id });
                } else {
                    io.to(socketid).emit('message', { text: text, from: x, id: id });
                }
            }

            const a = await db.Message.create({
                message: text, UserId: from.dataValues.id, ChatRoomId: room.dataValues.id 
            });
            room.dataValues.Messages.push(a);
        });

        socket.on('changeRoom', async function({ oldRoom, newRoom, lid }) {
            console.log(diction)
            // restart the diction!
            const dici =  await resetDictionary();
            const dc =  await resetIdLidictionary(socket.data.user.dataValues.id);
            var c = Object.keys(dc).find(key => dc[key] === lid);
            console.log(dc, dici, '-----------------------------------', c, newRoom, oldRoom)
            var a;
            a = Object.keys(dici).find(key => dici[key] === c);
            console.log(a, '-----------------------')
            if (a != undefined){
                console.log('NewRoomOwn----------------------')
            } else {
                a = newRoom;
            }
            var b;
            b = Object.keys(dici).find(key => dici[key] === oldRoom);
            console.log(b, '-----------------------')
            if (b != undefined){
                console.log('OldRoomOwn-----------------------')
            } else {
                b = oldRoom;
            }
            console.log(a,b, '-----------------------')

            const room = await db.ChatRoom.findAll({where:{ roomName: a }, include: [{
                model: db.Users,
                required: false,
                through: {
                  model: db.User_Rooms,
                }//                                                                          __
              }, db.Message]});//                                                           /  \
            socket.leave(b); // you need to make every user belongs to iceCream room       !Done!
            //console.log(room)//                                                          \____/
            socket.data.activeRoom = room;    ////it is adding to every body |
            socket.join(a); //                      fix here          \|/ it send it to every body instead of only the current user
            var dictionary = {};

            const array = await db.Contacts.findAll({ where: { UserId: socket.data.user.dataValues.id } });
            for (let i = 0; i < array.length; i++){
                var value = array[i].dataValues;
                dictionary[value.RealUserId] = value.userName;
            }
            console.log(dictionary)
            const messages = await db.ChatRoom.findOne({ where: { roomName: a }, include: [db.Message]});
            console.log(messages)
            if (messages === null){
                io.to(socket.id).emit('message', { from: 'Server', text: `No messages Yet`});
            } else {
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
                    liMess.push({ from: name, text: elm.message });
                    console.log(name)
                }
                for(let b of liMess){ //                    *   
                    console.log(b)
                    io.to(socket.id).emit('message', { text: b.text, from: b.from, id: socket.data.user.dataValues.id});
                }
            }
        });

    })
}

module.exports.init = init;
module.exports.flash = flash;