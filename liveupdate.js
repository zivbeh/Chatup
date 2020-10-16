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
    flas = flash[0];
}

// function lobb(){
//     console.log('-------------------------------------------------lobby--------------------------------------------');
//     return new Promise(async (resolve, reject) => {
//         const lobby  = await db.ChatRoom.findAll({where:{ roomName: flas }, include: [{
//             model: db.Users,
//             required: false,
//             through: {
//               model: db.User_Rooms,
//             }
//         }, db.Message]});
    
//         if(done) {
//           resolve(lobby);
//         }
    
//         //call reject if something isn't right
//         reject('something went wrong');
//       });
// }
// const lobby = lobb(); 


function init(server) {
    const io = socketio(server);
    init.io = io;

    io.on('connection', async socket => { // i need to have a way to comunicate with the routes
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

        //const lobby = await db.ChatRoom.findOne({where:{ roomName: 'iceCream' }, include: [db.Message]});

        session(req, res,  async () => {
            if (req.session && req.session.passport && req.session.passport.user) {
                console.log(lobby,'-----------dfdf---------------------------fdfd------');
                const user = await db.Users.findByPk(req.session.passport.user, function(err, user) {
                    if (err) return socket.disconnect();
                });

                socket.data = { user: user, activeRoom: lobby };
                //console.log(socket.data.activeRoom)
                io.to(socket.data.activeRoom[0].dataValues.roomName).emit('message', { from: 'Server', text: `User Joined: ${user.Name}`});
                //console.log('new user', user.Email);
            } else {
                //console.log('--- 2 user not authenticatetd, bye bye');
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
                  model: db.User_Rooms, // room is [] fix this
                }
              }, db.Message]});
            if(room===[]){
                console.log('problem');
            } else {
                console.log(room,'--------------gd-g-fg-f-g-f-------------123435----------------')
                io.emit('createRoom', room[0].dataValues.roomName);
                // socket.leave(socket.data.activeRoom[0].dataValues.roomName);
                // socket.data.activeRoom = room;  /// work now do it!<=
                // socket.join(room[0].dataValues.roomName);
                io.to(room[0].dataValues.roomName).emit('message', { text: `Room: ${room[0].dataValues.roomName} has been created`, from: 'Server'});
                io.to(room[0].dataValues.roomName).emit('message', { text: `${socket.data.user.dataValues.Name} has joined to: ${room[0].dataValues.roomName} by ${socket.data.user.dataValues.Name}`, from: 'Server'});
            }
        }

        socket.on('message', async function(text, id) {
            console.log('new message: ', text, id);
            const from = socket.data.user;
            const room = socket.data.activeRoom[0];
            const x = from.dataValues.Name;
            console.log(room.dataValues, '----------------------', x, id)
            //io.to(room[0].dataValues.roomName).emit('message', { text: text, from: x, id: id });

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
            //console.log(room,'--------------gd-g-fg-f-g-f-------------123435----------------')
            // for(let b of room[0].dataValues.Messages){
            //     //console.log(b.dataValues.message);
            //     io.to(room[0].dataValues.roomName).emit('message', { text: b.dataValues.message, from: b.dataValues.UserId, id: socket.data.user.dataValues.id});
            // }
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
            for(let b of room[0].dataValues.Messages){ //                    *   
                //console.log(b.dataValues.message);
                io.to(socket.id).emit('message', { text: b.dataValues.message, from: b.dataValues.UserId, id: socket.data.user.dataValues.id});
            }
        });

    })
}

module.exports.init = init;
module.exports.flash = flash;