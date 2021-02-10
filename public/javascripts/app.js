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

    const $user = $('.UserName').get();

    let currentRoom = 'NoRoom';

    var htmlfoo;
    var str;

    function messageon(msg){
        str = '';
        htmlfoo = '';
        //if(typeof msg.id === Number){
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
        //}

        if (htmlfoo === ''){
            text = msg.text;
        } else {
            text = htmlfoo;
        }
        return text;
    }

    
    window.App = {
        createRoom(roomName) {
            console.log($roomList[0].children.length, $('.room-list')[0].children.length)
            $('.room-list').append(`<li id="${$('.room-list')[0].children.length}" class="room"><div id="Nope" class="parent"><span id="No" class="roomname">${roomName}</span> <i class='material-icons remove'>delete</i></div></li>`)
        },

        deleteRoom(roomName) {
            if ($roomList.length == 1) {
                document.getElementById('send').style.display = 'none';
                document.getElementById('cons').style.display = "none";
                document.getElementById('clear').style.display = "grid";
            }
            $roomList.find(`#${roomName}`)[0].parentNode.removeChild($roomList.find(`#${roomName}`)[0]); 
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
        var newRoomName = ev.target.textContent;
        if (newRoomName === 'delete'){
            newRoomName = ev.target.parentNode.textContent;
            return;
        }
        var Id = $(this).attr('id');
        if(Id=='Nope'){
            Id = $(this.parentNode).attr('id');
        } else if(Id=='No'){
            Id = $(this.parentNode.parentNode).attr('id');
        }
        if (currentRoom === Id) return;

        var widt = $(window).width();
        if(widt<=768){
            const e = document.getElementById('gingi');
            e.style.display = "block";
            const x = document.getElementById('main');
            x.style.display = "block";
            const d = document.getElementById('sidebar');
            d.style.display = "none";
        }
        
        var height = $('main').height();
        var cons6 = document.getElementById('cons');
        cons6.style.height = height+"px";
        
        if (currentRoom != 'NoRoom'){
            $('.room.active').removeClass('active');
        }
        if($(ev.target).attr('class') === 'parent'){
            $(ev.target.parentNode).addClass('active');
        } else if($(ev.target).attr('class') === 'roomname') {
            $(ev.target.parentNode.parentNode).addClass('active');
        }

        document.getElementById('send').style.display = 'flex';
        document.getElementById('cons').style.display = "flex";
        server.changeRoom(currentRoom, Id);
        document.getElementById('clear').style.display = "none";
        $panel.html('');
        currentRoom = Id;
    });

    $roomList.on('click', '.remove ', function (ev) {

        var Id = $(this.parentNode.parentNode).attr('id');
        console.log(Id, this.parentNode.parentNode)
        server.deleteRoom(Id);
    });

    $myMessageBox.on('keydown', function (ev) {
        if(ev.keyCode === 13){
            const messageText = $myMessageBox.val();
            $myMessageBox.val('');
            
            server.sendMessage(messageText, $('.room.active').attr('id'));
        }else{
            return;
        }
    });
}());


/* <script>
//         <% activeRoom.forEach(msg => { %>
//     <% if(user.dataValues.id === msg.id){ %>
//         <div class="poc">
//             <div class="_2hqOq message-in" tabindex="-1">
//                 <div class="_2et95 my">
//                     <span data-testid="tail-in" data-icon="tail-in" class="_2-dPL"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 13" width="8" height="13"><path opacity=".13" fill="#0000000" d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z"></path><path fill="currentColor" d="M1.533 2.568L8 11.193V0H2.812C1.042 0 .474 1.156 1.533 2.568z"></path></svg></span>
//                     <span dir="auto" class="_3Whw5">
//                         <span class="messagon"><%= msg.message %></span>
//                     </span>
//                 </div>
//             </div>
//         </div>
//     <% } else { %>
//         <div class="poc">
//             <div class="_2hqOq message-out" tabindex="-1">
//                 <div class="_2et95 _2et95-No-ziv">
//                     <span data-testid="tail-out" data-icon="tail-out" class="_2-dPL"><svg xmlns="http://www.w3.org/2000/svg" class="friend" viewBox="0 0 8 13" width="8" height="13"><path opacity=".13" d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"></path><path fill="currentColor" d="M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z"></path></svg></span>
//                     <span dir="auto" class="_3Whw5">
//                         <div class="parent"><b class="hi"><%= msg.UserId %></b></div><span class="messagon"><%= msg.message %></span>
//                     </span>
//                 </div>
//             </div>
//         </div>
//     <% } %>
// <% }) %>
</script> */