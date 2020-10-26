(async function () {
    let server = {
        changeRoom(oldRoom, newRoom) { },
        sendMessage(text) { },
        createRoom(roomName) { },
        deleteRoom(roomName) { },
    }

    const $panel = $('.cons');
    const $myMessageBox = $('.my-message-box');

    const $roomList = $('.room-list');
    var list = document.getElementById("room-list");

    const $user = $('.UserName').get();
    console.log($user);

    let currentRoom = 'iceCream';

    var htmlfoo;
    var str;

    function messageon(msg){
        if(typeof msg.id === Number){
            var height = $(window).height();
            if(height == 568){
                $('.messagon').each(function () {
                str = msg.text;
                htmlfoo = str.match(/.{1,19}/g).join("<br/>");
            });
                
            } else {
                $('.messagon').each(function () {
                    str = msg.text;
                    htmlfoo = str.match(/.{1,46}/g).join("<br/>");
                });
            }
        }

        if (typeof msg.id === Number){
            text = htmlfoo;
        } else {
            text = msg.text;
        }
        return text;
    }

    
    window.App = {
        createRoom(roomName) {
            console.log(roomName)
            $roomList.append(`<li class="room"><div class="parent"><span class="roomname">${roomName}</span> <i class='material-icons remove'>delete</i></div></li>`)
        },

        deleteRoom(roomName) {
            console.log(roomName, '-gfd-g-df-----gdf---readdy')
            
            const a = $(`li:contains(${roomName})`);
            if($(`li:contains(${roomName})`)) {
                console.log('found', a.parent()[0], a[0])
                a.parent()[0].removeChild(a[0]); 
            } else {
                console.log('not found')
            }
        },

        newMessage(msg) {
            const text = messageon(msg);

            if(msg.from === 'Server') {
                $panel.append(`<div class="poc">
                <div class="_2hqOq message-server" tabindex="-1">
                    <div class="_1E1g0">
                        <span dir="auto" class="_3Whw5">
                            <b> ${msg.from}</b><br> ${msg.text}
                        </span>
                    </div>
                </div>
            </div>`);
            } else if(msg.from === $user[0].textContent){
            $panel.append(`<div class="poc">
            <div class="_2hqOq message-in" tabindex="-1">
                <div class="_2et95 my">
                    <span data-testid="tail-in" data-icon="tail-in" class="_2-dPL"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 13" width="8" height="13"><path opacity=".13" fill="#0000000" d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z"></path><path fill="currentColor" d="M1.533 2.568L8 11.193V0H2.812C1.042 0 .474 1.156 1.533 2.568z"></path></svg></span>
                    <span dir="auto" class="_3Whw5">
                    <span class="messagon">${text}</span>
                    </span>
                </div>
            </div>
        </div>`);
            } else {
                $panel.append(`<div class="poc">
                <div class="_2hqOq message-out" tabindex="-1">
                    <div class="_2et95 _2et95-No-ziv">
                        <span data-testid="tail-out" data-icon="tail-out" class="_2-dPL"><svg xmlns="http://www.w3.org/2000/svg" class="friend" viewBox="0 0 8 13" width="8" height="13"><path opacity=".13" d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"></path><path fill="currentColor" d="M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z"></path></svg></span>
                        <span dir="auto" class="_3Whw5">
                            <div class="parent"><b class="hi">${msg.from}</b></div><span class="messagon">${text}</span>
                        </span>
                    </div>
                </div>
            </div>`);
            }

            const d = document.getElementById('cons');
            d.scrollTo(0,d.scrollHeight);
        },

        setServer(_server) {
            server = _server;
        }
    }

    $roomList.on('click', '.room', function (ev) {
        console.log(ev.target)
        var newRoomName = ev.target.textContent;
        if (newRoomName === 'delete'){
            newRoomName = ev.target.parentNode.textContent;
            return;
        }
        var newRoomName = newRoomName.replace(' delete','');
        if (currentRoom === newRoomName) return;

        server.changeRoom(currentRoom, newRoomName);

        var height = $('main').height();
        console.log(height);
        var cons6 = document.getElementById('cons');
        cons6.style.height = height+"px";
        

        $('.room.active').removeClass('active');
        $(ev.target).addClass('active');
        $panel.html('');
        currentRoom = newRoomName;
    });

    $roomList.on('click', '.remove ', function (ev) {
        console.log('work!!!', ev.target.parentNode.parentNode);
        //ev.target.parentNode.parentNode.parentNode.removeChild(ev.target.parentNode.parentNode);
        const target = ev.target.parentNode.parentNode.textContent;
        server.deleteRoom(target.replace(' delete',''));
    });

    $myMessageBox.on('keydown', function (ev) {
        if(ev.keyCode === 13){
            const messageText = $myMessageBox.val();
            $myMessageBox.val('');
            
            server.sendMessage(messageText, $user[0].textContent);
        }else{
            return;
        }
    });
}());