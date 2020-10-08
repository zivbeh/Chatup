function passwordShower() {
    var x = document.getElementById("exampleInputPassword1");
    if (x.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
}

window.onload = function(){
  var height = $('main').height();
  console.log(height);
  var cons6 = document.getElementById('cons');
  cons6.style.height = height+"px";
  
  const d = document.getElementById('cons');
  d.scrollTo(0,d.scrollHeight);
}

var width = $(window).width();
$(window).on('resize', function() {
  var cons = document.getElementById('cons');
  var cons1 = $('.main');
  var hie = cons1.height()-50;
  cons.style.maxHeight = hie+"px";
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


(function () {
  const socket = io();
  socket.on('createRoom', App.createRoom);
  socket.on('message', App.newMessage);

  const server = {
      changeRoom(oldRoom, newRoom) {
          socket.emit('changeRoom', { oldRoom, newRoom });
      },

      sendMessage(text, id) {
          socket.emit('message', text, id);
      },

      createRoom(roomna) {
          socket.emit('createRoom', roomna);
      }
  };

  App.setServer(server);
}());