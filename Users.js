const db = require('./models');

async function createUser(name, pass, mail){
    console.log('here');
    await db.Users.create(
        { Name: name, Password: pass, Email: mail } /////
    );

    console.log('here1');
}

async function GetAllUsers() {
    const M = await db.Users.findAll();
    
    for (let b of M) {
        console.log(`name: ${b.dataValues.Name}, Password: ${b.dataValues.Password}, Email: ${b.dataValues.Email}`);
    }
    return M;
}

async function see(){
    await createUser('ziv behar', 'zivziv1!', 'zivbeh@gmail.com');
    await createUser('Aviad Behar', '123456789', 'abehar@gmail.com');
    await createUser('lotem behar', '123456789', 'lotembeh@gmail.com');
    await db.ChatRoom.create(
        { roomName: 'iceCream' } /////
    );
    await GetAllUsers();
}

see();