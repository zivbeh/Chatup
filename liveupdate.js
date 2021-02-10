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
    flas = flash;
}

function init(server) {
    const io = socketio(server);
    init.io = io;

    io.on('connection', async socket => {
        let cookieString = socket.request.headers.cookie;

        let req = { connection: { encrypted: false }, headers: { cookie: cookieString } };
        let res = { getHeader: () => { }, setHeader: () => { } };

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
            return ctionary;
        }

        session(req, res,  async () => {
            if (req.session && req.session.passport && req.session.passport.user) {

                // const lobby  = await db.ChatRoom.findAll({where:{ id: 1 }, include: [{
                //     model: db.Users,
                //     required: false,
                //     through: {
                //       model: db.User_Rooms,
                //     }
                // }, db.Message]});

                const user = await db.Users.findByPk(req.session.passport.user, function(err, user) {
                    if (err) return socket.disconnect();
                });

                socket.data = { user: user, activeRoom: 'NoRoom' };
                
            } else {
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
                    if(name3==null){
                        const namit = await db.Users.findByPk(idn);
                        io.to(socket.id).emit('createRoom', namit.dataValues.Name);
                    }else {
                        io.to(socket.id).emit('createRoom', name3.dataValues.userName);
                    }
                    if(Object.keys(dict).length==2){
                        var name4 = await db.Contacts.findOne({ where: { UserId: NoId, RealUserId: socket.data.user.dataValues.id } });
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
            }
            flas = 'iceCream';
        }
        

        socket.on('deleteRoom', async function(Name) {
            const dc =  await resetIdLidictionary(socket.data.user.dataValues.id);
            var c = Object.keys(dc).find(key => dc[key] == Name);
            const roo = await db.ChatRoom.findOne({ where: {id: c}, include: [{
                model: db.Users,
                required: false,
                through: {
                    model: db.User_Rooms,
                }
            }] });

            if(roo.dataValues.Users.length == 2){
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
                
                if(Object.keys(dict).length==2){//will not work if 3 people are connected you need to compare them with the you know
                    var socketId = dict['socketId'];
                    var userId = dict['userId'];
                    var dd = await resetIdLidictionary(userId);
                    var realName = dd[c];
                    
                    io.to(socketId).emit('deleteRoom', dd[c]);
                    io.to(socket.id).emit('deleteRoom', Name);
                } else {
                    io.to(socket.id).emit('deleteRoom', Name);
                }

                await db.User_Rooms.destroy({ where: { ChatRoomId: roo.dataValues.id }});

                // await roo.destroy();
                // io.emit('deleteRoom', Name);
            } else {
                await db.User_Rooms.destroy({ where: { ChatRoomId: roo.dataValues.id, UserId: socket.data.user.dataValues.id }});
                io.to(socket.id).emit('deleteRoom', Name);
            }
        });

        socket.on('message', async function(text, id) {

            const dc =  await resetIdLidictionary(socket.data.user.dataValues.id);

            var RoomId = Object.keys(dc).find(key => dc[key] == id);

            const from = socket.data.user;
            const x = from.dataValues.Name;
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
            if(oldRoom=='NoRoom'){
                d='NoRoom';
            }

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
            const messages = await db.ChatRoom.findOne({ where: { id: a }, include: [db.Message]});
            if (messages.dataValues.Messages.length === 0){
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
