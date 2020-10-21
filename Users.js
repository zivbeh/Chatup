const db = require('./models');

async function create(){
    await db.ChatRoom.create({
        roomName: 'iceCream'
    });
}

create();