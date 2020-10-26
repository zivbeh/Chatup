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

        session(req, res,  async () => {
            if (req.session && req.session.passport && req.session.passport.user) {
                console.log(lobby,'-----------dfdf---------------------------fdfd------');
                const user = await db.Users.findByPk(req.session.passport.user, function(err, user) {
                    if (err) return socket.disconnect();
                });

                socket.data = { user: user, activeRoom: lobby };
                io.to(socket.data.activeRoom[0].dataValues.roomName).emit('message', { from: 'Server', text: `User Joined: ${user.Name}`});
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
                console.log(room,'--------------gd-g-fg-f-g-f-------------123435----------------')
                io.emit('createRoom', flas);
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
            const room = await db.ChatRoom.findOne({ where: { roomName: roomName } });
            console.log(room)
            await db.User_Rooms.destroy({ where: { ChatRoomId: room.dataValues.id }})
            await room.destroy();
            
            io.emit('deleteRoom', roomName);
        });

        socket.on('message', async function(text, id) {
            console.log('new message: ', text, id);
            const from = socket.data.user;
            const room = socket.data.activeRoom[0];
            const x = from.dataValues.Name;
            console.log(room.dataValues, '----------------------', x, id)
            //io.to(room[0].dataValues.roomName).emit('message', { text: text, from: x, id: id });
            //const contact = await db.Contacts.findOne({ where: { UserId: from.dataValues.id,  } });

            io.to(room.dataValues.roomName).emit('message', { text: text, from: x, id: id });
            //console.log(id);

            const a = await db.Message.create({
                message: text, UserId: from.dataValues.id, ChatRoomId: room.dataValues.id 
            });
            room.dataValues.Messages.push(a); // fix here
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
            socket.data.activeRoom = room;  /// work now do it!<=
            socket.join(room[0].dataValues.roomName);
            io.emit('createRoom', room[0].dataValues.roomName);
            io.to().emit('message', { text: `Room: ${room[0].dataValues.roomName} has been created`, from: 'Server'});
            io.to(room[0].dataValues.roomName).emit('message', { text: `${socket.data.user.dataValues.Name} has joined to: ${room[0].dataValues.roomName} by ${socket.data.user.dataValues.Name}`, from: 'Server'});
        });

        socket.on('changeRoom', async function({ oldRoom, newRoom }) {
            const room = await db.ChatRoom.findAll({where:{ roomName: newRoom }, include: [{
                model: db.Users,
                required: false,
                through: {
                  model: db.User_Rooms,
                }//                                                                          __
              }, db.Message]});//                                                           /  \
            //console.log(room, newRoom, oldRoom);//                                         |~  ~|
            socket.leave(oldRoom); // you need to make every user belongs to iceCream room !Done!
            //console.log(room)//                                                            \____/
            socket.data.activeRoom = room;    ////it is adding to every body |
            socket.join(newRoom); //                      fix here          \|/ it send it to every body instead of only the current user
            var dictionary = {};

            const array = await db.Contacts.findAll({ where: { UserId: socket.data.user.dataValues.id } });
            for (let i = 0; i < array.length; i++){
                var value = array[i].dataValues;
                dictionary[value.RealUserId] = value.userName;
            }
            console.log(dictionary, array)

            const messages = await db.ChatRoom.findOne({ where: { roomName: newRoom }, include: [db.Message]});
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
            console.log(liMess)

            for(let b of liMess){ //                    *   
                //console.log(b.dataValues.message);          make the dictionary here as well
                io.to(socket.id).emit('message', { text: b.text, from: b.from, id: socket.data.user.dataValues.id});
            }
        });

    })
}

module.exports.init = init;
module.exports.flash = flash;