function passwordShower() {
    var x = document.getElementById("exampleInputPassword1");
    if (x.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
}
function heightsizer(){
  var height = $('main').height();
  console.log(height);
  var cons6 = document.getElementById('cons');
  cons6.style.height = height+"px";

  var roomlist = document.getElementById('room-list');
  roomlist.style.maxHeight = (height-65)+"px";
}

window.onload = function(){
  heightsizer();

  const y = document.getElementById('send');
  y.style.display = "none";
  const x = document.getElementById('cons');
  x.style.display = "none";
  console.log($('.messagon1231'));

  // const d = document.getElementById('cons');
  // d.scrollTo(0,d.scrollHeight);
}
function size(){
  var widt = $(window).width();
  if(widt<=760){
    const g = document.getElementById('gingi');
    g.style.display = "block";
  } else {
    const e = document.getElementById('gingi');
    e.style.display = "none";
    const d = document.getElementById('sidebar');
    d.style.width = "50%";
    const x = document.getElementById('main');
    x.style.display = "block";
  }
}
size();
document.getElementById("Back").addEventListener("click", function () {
  const e = document.getElementById('gingi');
  e.style.display = "none";
  const x = document.getElementById('main');
  x.style.display = "none";
  const d = document.getElementById('sidebar');
  d.style.display = "block";
  d.style.width = "100%";
}, false);

var width = $(window).width();
$(window).on('resize', function() {
  var cons = document.getElementById('cons');
  var cons1 = $('.main');
  var hie = cons1.height()-50;
  cons.style.maxHeight = hie+"px";

  size();
  heightsizer();
});

var height = $(window).height();
if(height == 568){
  $('.messagon').each(function () {
    var str = $(this).html();
    var htmlfoo = str.match(/.{1,20}/g).join("<br/>");
    $(this).html(htmlfoo);
  });

  var cons4 = document.getElementById('cons');
  var hier = 400;
  cons4.style.maxHeight = hier+"px";
  
} else {
  $('.messagon').each(function () {
    var str = $(this).html();
    var htmlfoo = str.match(/.{1,46}/g).join("<br/>");
    $(this).html(htmlfoo);
  });
}


var tiles = document.querySelector('html');
const a = document.getElementById('input');

a.addEventListener('input', function () {
  var filter = 'hue-rotate(xdeg)'.replace('x', a.value);
  console.log(filter, a.value)
  tiles.style.filter = filter;
}, false);


(function () {
  const socket = io();
  socket.on('createRoom', App.createRoom);
  socket.on('message', App.newMessage);
  socket.on('deleteRoom', App.deleteRoom);

  const server = {
      changeRoom(oldRoom, newRoom) {
          socket.emit('changeRoom', { oldRoom, newRoom });
      },

      sendMessage(text, id) {
          socket.emit('message', text, id);
      },

      deleteRoom(room) {
        socket.emit('deleteRoom', room);
      },

      createRoom(roomna) {
          socket.emit('createRoom', roomna);
      }
  };

  App.setServer(server);
}());