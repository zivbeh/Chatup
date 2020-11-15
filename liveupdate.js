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

        const lobby  = await db.ChatRoom.findAll({where:{ id: 1 }, include: [{
            model: db.Users,
            required: false,
            through: {
              model: db.User_Rooms,
            }
        }, db.Message]});

        var diction = {};
        // async function resetDictionary(){
        //     diction = {};
        //     roon = await db.ChatRoom.findAll({ where: { Due: true, '$Users.id$': socket.data.user.dataValues.id },
        //         include: [{
        //             model: db.Users,
        //             required: false,
        //             through: {
        //                 model: db.User_Rooms,
        //             }
        //         }]
        //     });
        //     console.log(roon, '-----------------------------------12345678878')

        //     for (let index = 0; index < roon.length; index++) {
        //         const element = roon[index];
        //         const i = element.dataValues.id;
        //         console.log(i)
        //         const li = await db.ChatRoom.findOne({ where: { id: i }, 
        //             include: [{
        //                 model: db.Users,
        //                 required: false,
        //                 through: {
        //                     model: db.User_Rooms,
        //                 }
        //             }]
        //         });
        //         var value0 = li.dataValues.Users[0].dataValues.id;
        //         var value1 = li.dataValues.Users[1].dataValues.id; // gets only 1 fix!!!
        //         var name;
        //         if(socket.data.user.dataValues.id === value0){
        //             name = await db.Contacts.findOne({ where: { RealUserId: value1, UserId: value0 } });
        //         } else {
        //             name = await db.Contacts.findOne({ where: { RealUserId: value0, UserId: value1 } });
        //         }
        //         if (name === null){
        //             name = element.dataValues.id;
        //             diction[element.dataValues.id] = name;
        //             console.log(name, '-----------------------------------123')
        //         } else {
        //             diction[element.dataValues.id] = name.dataValues.userName;
        //             console.log(name.dataValues.userName, '-----------------------------------123')
        //         }
        //     }
        //     console.log(diction)
        //     return diction;
        // }

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
                io.to(socket.data.activeRoom[0].dataValues.id).emit('message', { from: 'Server', text: `User Joined: ${user.Name}`});
                
                //const diction = await resetDictionary();
                const cc = await resetIdLidictionary(socket.data.user.dataValues.id);
            } else {
                socket.data = { user: 'Unknown', activeRoom: lobby };
                socket.disconnect();
            }
        });

        socket.join(1);

        if(flas != 'iceCream'){
            const room = await db.ChatRoom.findAll({where:{ id: flas }, include: [{
                model: db.Users,
                required: false,
                through: {
                  model: db.User_Rooms,
                }
              }, db.Message]});
            if(room===[]){
                console.log('problem');
            } else {
                console.log(room[0].dataValues.Users.length,'----------------------------------------------------asasa');
                if(room[0].dataValues.Users.length === 2){
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
                    console.log(value1,value0,'-fsd-fsd')
                    var connectedClients = Object.keys(io.clients().connected);
                    const dict = {};
                    for (var key in connectedClients) {
                        const d = connectedClients[key];
                        const us = io.sockets.connected[d];
                        const idr = us.data.user.dataValues.id;
                        if(idr==value0||idr==value1){
                            dict[d] = idr;
                        }
                    }
                    console.log(dict, Object.keys(dict).length)
                    var OtherUser;
                    var idn;
                    var NoId;
                    if(socket.data.user.dataValues.id === value1){
                        OtherUser = Object.keys(dict).find(key => dict[key] == value0);
                        idn=value0;
                        NoId=value1;
                    } else {
                        OtherUser = Object.keys(dict).find(key => dict[key] == value1);
                        idn=value1;
                        NoId=value0;
                    }
                    var name3 = await db.Contacts.findOne({ where: { UserId: socket.data.user.dataValues.id, RealUserId: idn } });
                    console.log(name3)
                    if(name3==null){
                        const namit = await db.Users.findByPk(idn);
                        io.to(socket.id).emit('createRoom', namit.dataValues.Name);
                    }else {
                        io.to(socket.id).emit('createRoom', name3.dataValues.userName);
                    }
                    if(Object.keys(dict).length==2){
                        var name4 = await db.Contacts.findOne({ where: { UserId: NoId, RealUserId: socket.data.user.dataValues.id } });
                        console.log(name4)
                        if(name4==null){
                            const namit1 = await db.Users.findByPk(NoId);
                            io.to(OtherUser).emit('createRoom', namit1.dataValues.Name);
                        }else {
                            io.to(OtherUser).emit('createRoom', name4.dataValues.userName);
                        }
                    }
                } else {
                    io.emit('createRoom', room[0].dataValues.roomName);
                }

                io.to(room[0].dataValues.id).emit('message', { text: `Room: ${room[0].dataValues.roomName} has been created`, from: 'Server'});
                io.to(room[0].dataValues.id).emit('message', { text: `${socket.data.user.dataValues.Name} has joined to: ${room[0].dataValues.roomName} by ${socket.data.user.dataValues.Name}`, from: 'Server'});
            }
            flas = 'iceCream';
        }
        

        socket.on('deleteRoom', async function(Name) {
            const dc =  await resetIdLidictionary(socket.data.user.dataValues.id);
            var c = Object.keys(dc).find(key => dc[key] == Name);
            console.log(c, Name, dc)
            const roo = await db.ChatRoom.findOne({ where: {id: c}, include: [{
                model: db.Users,
                required: false,
                through: {
                    model: db.User_Rooms,
                }
            }] });
            console.log(roo)

            if(roo.dataValues.Users.length == 2){
                console.log('yangaaaaaaaaaaaaaaaaaaa')
                var value0 = roo.dataValues.Users[0].dataValues.id;
                var value1 = roo.dataValues.Users[1].dataValues.id;
                var connectedClients = Object.keys(io.clients().connected);
                const dict = {};
                for (var key in connectedClients) {
                    const d = connectedClients[key];
                    const us = io.sockets.connected[d];
                    const idr = us.data.user.dataValues.id;
                    if(idr==value0&&d!=socket.id||idr==value1&&d!=socket.id){
                        dict['socketId'] = d;
                        dict['userId'] = idr;
                    }
                }
                console.log(dict)
                
                if(Object.keys(dict).length==2){//will not work if 3 people are connected you need to compare them with the you know
                    var socketId = dict['socketId'];
                    var userId = dict['userId'];
                    var dd = await resetIdLidictionary(userId);
                    console.log(dd,'------123')
                    var realName = dd[c];
                    console.log(realName,dd[realName],Name,c,'------123')
                    
                    io.to(socketId).emit('deleteRoom', dd[c]);
                    io.to(socket.id).emit('deleteRoom', Name);
                } else {
                    io.to(socket.id).emit('deleteRoom', Name);
                }

                //await db.User_Rooms.destroy({ where: { ChatRoomId: roo.dataValues.id }});

                // await roo.destroy();
                // io.emit('deleteRoom', Name);
            } else {
                console.log('yangaaaaaaaaaaaaaaaaaaaDODODODODODODODOODOD')
                //await db.User_Rooms.destroy({ where: { ChatRoomId: roo.dataValues.id, UserId: socket.data.user.dataValues.id }});
                io.to(socket.id).emit('deleteRoom', Name);
            }
        });

        socket.on('message', async function(text, id) {

            const dc =  await resetIdLidictionary(socket.data.user.dataValues.id);

            var RoomId = Object.keys(dc).find(key => dc[key] == id);

            const from = socket.data.user;
            const room = socket.data.activeRoom[0];
            const x = from.dataValues.Name;
            console.log(socket.data.activeRoom[0].dataValues.id)
            const users = io.sockets.adapter.rooms[socket.data.activeRoom[0].dataValues.id];
            const arr = [];
            for (var key in users.sockets) {
                if (users.sockets.hasOwnProperty(key)) {
                    arr.push(key);
                }
            }
            for (var b in arr){
                const socketid = arr[b];
                const us = io.sockets.connected[socketid];
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
                message: text, UserId: from.dataValues.id, ChatRoomId: RoomId 
            });
            socket.data.activeRoom[0].dataValues.Messages.push(a);
        });

        socket.on('changeRoom', async function({ oldRoom, newRoom }) {
            const dc =  await resetIdLidictionary(socket.data.user.dataValues.id);

            var c = Object.keys(dc).find(key => dc[key] == newRoom);
            var d = Object.keys(dc).find(key => dc[key] == oldRoom);
            console.log(dc, d, '---------------123123--------------------', c, newRoom, oldRoom)

            const room = await db.ChatRoom.findAll({ where: { id: c }, include: [{
                model: db.Users,
                required: false,
                through: {
                  model: db.User_Rooms,
                }
            }, db.Message] });

            socket.leave(d);
            socket.data.activeRoom = room; 
            socket.join(c); 

            var dictionary = {};
            var a = room[0].dataValues.id;
            const array = await db.Contacts.findAll({ where: { UserId: socket.data.user.dataValues.id } });
            for (let i = 0; i < array.length; i++){
                var value = array[i].dataValues;
                dictionary[value.RealUserId] = value.userName;
            }
            console.log(dictionary)
            const messages = await db.ChatRoom.findOne({ where: { id: a }, include: [db.Message]});
            console.log(messages, '--------------------------------', a)
            if (messages.dataValues.Messages.length === 0){
                io.to(socket.id).emit('message', { from: 'Server', text: `No messages Yet`});
            } else {
                const m = messages.dataValues.Messages;
                var liMess = [];
                for (let c = 0; c < m.length; c++){
                    var elm = m[c].dataValues;
                    console.log(elm.message,'-4324809253hjds')
                    var userId = elm.UserId;
                    var name = dictionary[userId];
                    if (name === undefined){ // use the regular name
                        const userr = await db.Users.findByPk(userId);
                        name = userr.dataValues.Name;
                    }
                    liMess.push({ from: name, text: elm.message });
                    console.log(name)
                }
                for(let b of liMess){
                    io.to(socket.id).emit('message', { text: b.text, from: b.from, id: socket.data.user.dataValues.id});
                }
            }
        });

    })
}

module.exports.init = init;
module.exports.flash = flash;