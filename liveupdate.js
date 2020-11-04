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

            for (let index = 0; index < roon.length; index++) {
                const element = roon[index];
                const i = element.dataValues.id;
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
                    // name = element.dataValues.roomName;
                    // diction[element.dataValues.roomName] = name;
                } else {
                    diction[element.dataValues.roomName] = name.dataValues.userName;
                }
            }
        }

        session(req, res,  async () => {
            if (req.session && req.session.passport && req.session.passport.user) {
                const user = await db.Users.findByPk(req.session.passport.user, function(err, user) {
                    if (err) return socket.disconnect();
                });

                socket.data = { user: user, activeRoom: lobby };
                io.to(socket.data.activeRoom[0].dataValues.roomName).emit('message', { from: 'Server', text: `User Joined: ${user.Name}`});
                
                resetDictionary();
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
        

        socket.on('deleteRoom', async function(roomName) {
            console.log(diction)
            var a;
            a = Object.keys(diction).find(key => diction[key] === roomName);
            if (a != null){
                console.log('NewRoomOwn----------------------')
            } else {
                a = roomName;
            }
            const room = await db.ChatRoom.findOne({ where: { roomName: a } });
            const con = await db.User_Rooms.findAll({ where: { ChatRoomId: room.dataValues.id }});
            
            if(con === [] || a != null){
                await room.destroy();
                await db.User_Rooms.destroy({ where: { ChatRoomId: room.dataValues.id }});
                io.emit('deleteRoom', roomName);
            } else {
                await db.User_Rooms.destroy({ where: { ChatRoomId: room.dataValues.id, UserId: socket.data.user.dataValues.id }});
                io.to(socket.id).emit('deleteRoom', roomName);
            }
        });

        socket.on('message', async function(text, id) {
            const from = socket.data.user;
            const room = socket.data.activeRoom[0];// use this users and sent to each of them diffrent message
            const x = from.dataValues.Name;
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

        // socket.on('createRoom', async function(roomNa) {
        //     const room = await db.ChatRoom.findAll({where:{ roomName: roomNa }, include: [{
        //         model: db.Users,
        //         required: false,
        //         through: {
        //           model: db.User_Rooms,
        //         }
        //       }, db.Message]});
        //     socket.leave(socket.data.activeRoom[0].dataValues.roomName);
        //     socket.data.activeRoom = room;
        //     socket.join(room[0].dataValues.roomName);
        //     io.emit('createRoom', room[0].dataValues.roomName);
        //     io.to().emit('message', { text: `Room: ${room[0].dataValues.roomName} has been created`, from: 'Server'});
        //     io.to(room[0].dataValues.roomName).emit('message', { text: `${socket.data.user.dataValues.Name} has joined to: ${room[0].dataValues.roomName} by ${socket.data.user.dataValues.Name}`, from: 'Server'});
        // });

        socket.on('changeRoom', async function({ oldRoom, newRoom }) {
            console.log(diction)
            // restart the diction!
            resetDictionary();
            var a;
            var b;
            a = Object.keys(diction).find(key => diction[key] === newRoom);
            if (a != null){
                console.log('NewRoomOwn----------------------')
            } else {
                a = newRoom;
            }
            b = Object.keys(diction).find(key => diction[key] === oldRoom);
            if (b != null){
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

            const messages = await db.ChatRoom.findOne({ where: { roomName: a }, include: [db.Message]});

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
                    io.to(socket.id).emit('message', { text: b.text, from: b.from, id: socket.data.user.dataValues.id});
                }
            }
        });

    })
}

module.exports.init = init;
module.exports.flash = flash;