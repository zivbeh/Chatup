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
        session(req, res,  async () => {
            if (req.session && req.session.passport && req.session.passport.user) {
                console.log(lobby,'-----------dfdf---------------------------fdfd------');
                const user = await db.Users.findByPk(req.session.passport.user, function(err, user) {
                    if (err) return socket.disconnect();
                });

                socket.data = { user: user, activeRoom: lobby };
                io.to(socket.data.activeRoom[0].dataValues.roomName).emit('message', { from: 'Server', text: `User Joined: ${user.Name}`});
                
                const roon = await db.ChatRoom.findAll({ where: { Due: true, '$Users.id$': socket.data.user.dataValues.id },
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
                        console.log('-----1-----')
                        name = await db.Contacts.findOne({ where: { RealUserId: value1, UserId: value0 } });
                    } else {
                        console.log('-----0-----')
                        name = await db.Contacts.findOne({ where: { RealUserId: value0, UserId: value1 } });
                    }
                    if (name === null){
                        name = element.dataValues.roomName;
                        diction[element.dataValues.roomName] = name;
                    } else {
                        diction[element.dataValues.roomName] = name.dataValues.userName;
                    }
                }

            } else {
                socket.data = { user: 'Unknown', activeRoom: lobby };
                socket.disconnect();
            }
        });

        socket.join('iceCream');

        if(flas != 'iceCream'){
            console.log(flas)
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
                console.log(Contacts.length, '-----0-0-0-0-0-0-0-0-0-0-----')
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
                    console.log(element, li)
                    var value0 = li.dataValues.Users[0].dataValues.id;
                    var value1 = li.dataValues.Users[1].dataValues.id;
                    var name;
                    if(socket.data.user.dataValues.id === value0){
                        console.log('-----1-----')
                        name = await db.Contacts.findOne({ where: { RealUserId: value1, UserId: value0 } });
                    } else {
                        console.log('-----0-----')
                        name = await db.Contacts.findOne({ where: { RealUserId: value0, UserId: value1 } });
                    }
                    console.log(name, value0, value1)
                    if (name === null){
                        name = element.dataValues.roomName;
                        diction[element.dataValues.roomName] = name;
                        io.emit('createRoom', name);
                    } else {
                        diction[element.dataValues.roomName] = name.dataValues.userName;
                        io.emit('createRoom', name.dataValues.userName);
                    }
                } else {
                    io.emit('createRoom', flas);
                }

                console.log(diction, room,'--------------gd-g-fg-f-g-f-------------123435----------------')
                console.log(name)
                socket.leave(socket.data.activeRoom[0].dataValues.roomName);
                socket.data.activeRoom = room;
                socket.join(room[0].dataValues.roomName);
                io.to(room[0].dataValues.roomName).emit('message', { text: `Room: ${room[0].dataValues.roomName} has been created`, from: 'Server'});
                io.to(room[0].dataValues.roomName).emit('message', { text: `${socket.data.user.dataValues.Name} has joined to: ${room[0].dataValues.roomName} by ${socket.data.user.dataValues.Name}`, from: 'Server'});
            }
            flas = 'iceCream';
        }
        

        socket.on('deleteRoom', async function(roomName) {
            console.log(roomName,'---------------------sd');
            console.log(diction)
            var a;
            a = Object.keys(diction).find(key => diction[key] === roomName);
            console.log(a, '-----------------------')
            if (a != null){
                console.log('NewRoomOwn----------------------')
            } else {
                a = roomName;
            }
            console.log(a, '-----------------------')
            const room = await db.ChatRoom.findOne({ where: { roomName: a } });
            console.log(room);
            await db.User_Rooms.destroy({ where: { ChatRoomId: room.dataValues.id, UserId: socket.data.user.dataValues.id }});
            const con = await db.User_Rooms.findAll({ where: { ChatRoomId: room.dataValues.id }});
            console.log(con)
            
            if(con === [] || a === Object.keys(diction).find(key => diction[key] === roomName)){
                await room.destroy();
                io.emit('deleteRoom', roomName);
            } else {
                io.to(socket.id).emit('deleteRoom', roomName);
            }
        });

        socket.on('message', async function(text, id) {
            console.log('new message: ', text, id);
            const from = socket.data.user;
            const room = socket.data.activeRoom[0];
            const x = from.dataValues.Name;
            console.log(room.dataValues, '----------------------', x, id)

            io.to(room.dataValues.roomName).emit('message', { text: text, from: x, id: id });

            const a = await db.Message.create({
                message: text, UserId: from.dataValues.id, ChatRoomId: room.dataValues.id 
            });
            room.dataValues.Messages.push(a);
        });

        socket.on('createRoom', async function(roomNa) {
            const room = await db.ChatRoom.findAll({where:{ roomName: roomNa }, include: [{
                model: db.Users,
                required: false,
                through: {
                  model: db.User_Rooms,
                }
              }, db.Message]});
            socket.leave(socket.data.activeRoom[0].dataValues.roomName);
            socket.data.activeRoom = room;
            socket.join(room[0].dataValues.roomName);
            io.emit('createRoom', room[0].dataValues.roomName);
            io.to().emit('message', { text: `Room: ${room[0].dataValues.roomName} has been created`, from: 'Server'});
            io.to(room[0].dataValues.roomName).emit('message', { text: `${socket.data.user.dataValues.Name} has joined to: ${room[0].dataValues.roomName} by ${socket.data.user.dataValues.Name}`, from: 'Server'});
        });

        socket.on('changeRoom', async function({ oldRoom, newRoom }) {
            console.log(diction)
            var a;
            var b;
            if (diction.hasOwnProperty(newRoom)){
                console.log('NewRoomOwn----------------------')
                //a = diction[`${newRoom}`];
                a = Object.keys(diction).find(key => diction[key] === newRoom);
            } else {
                a = newRoom;
            }
            if (diction.hasOwnProperty(oldRoom)){
                console.log('OldRoomOwn-----------------------')
                //b = diction[`${oldRoom}`];
                b = Object.keys(diction).find(key => diction[key] === oldRoom);
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
            socket.leave(b); // you need to make every user belongs to iceCream room !Done!
            //console.log(room)//                                                          \____/
            socket.data.activeRoom = room;    ////it is adding to every body |
            socket.join(a); //                      fix here          \|/ it send it to every body instead of only the current user
            var dictionary = {};

            const array = await db.Contacts.findAll({ where: { UserId: socket.data.user.dataValues.id } });
            for (let i = 0; i < array.length; i++){
                var value = array[i].dataValues;
                dictionary[value.RealUserId] = value.userName;
            }
            console.log(dictionary, array)

            const messages = await db.ChatRoom.findOne({ where: { roomName: a }, include: [db.Message]});
            console.log('-----d-d-------------d-d----------d-d---', messages)

            if (messages === null){
                io.to(socket.id).emit('message', { from: 'Server', text: `No messages Yet`});
            } else {
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
                    liMess.push({ from: name, text: elm.message });
                    console.log(name)
                }
                for(let b of liMess){ //                    *   
                    //console.log(b.dataValues.message);          make the dictionary here as well
                    io.to(socket.id).emit('message', { text: b.text, from: b.from, id: socket.data.user.dataValues.id});
                }
            }
        });

    })
}

module.exports.init = init;
module.exports.flash = flash;