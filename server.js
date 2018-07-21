var http = require('http');
var app = http.createServer();

var io = require('socket.io').listen(app);
var users = [];

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

io.sockets.on('connection', (socket)=>{
  socket.on('usname', (usname)=>{
    socket.username = usname;
    socket.emit('wellcome', true);
    users.push(usname);
    console.log(socket.username+' bağlandı!');
    console.log('Bağlı kullanıcılar:'+users);
  });

  socket.on('disconnect', ()=>{
  	users.remove(socket.username);
    console.log(socket.username+' adlı kullanıcının bağlantısı koptu!');
  });

  socket.on('back-url', (url)=>{
    io.emit('backurl',url);
  });

  socket.on('gpsdegis', (neyapsin)=>{
    io.emit('gpsd',neyapsin);
  });

  socket.on('notifver', (text)=>{
  	io.emit('notif', text);
  });

  socket.on('coord', (koord)=>{
    socket.broadcast.emit('coordin', {
      usname: socket.username,
      lat:koord.lat,
      long:koord.long
    });
    console.log(socket.username+' şurada: '+koord.lat+' | '+koord.long);
  });
});

app.listen(3520);
