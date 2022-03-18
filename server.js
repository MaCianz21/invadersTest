const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
var player={};
app.use(express.static(__dirname + '/public'));
var point={};
var id;
var roomArray={};
var numRoom=0;
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
io.on('connection', (socket) => {
  
  console.log('user '+socket.id+' connected');

  socket.on('createRoom', function(room) {
    
    var roomName = room.name;
    roomArray[roomName] = {};
    roomArray[roomName][room.nickname] = 0;
    player[roomName]=room.numberPlayer -1;
    socket.join(roomName);
    console.log('Room '+roomName+' created  '+numRoom );
    
    var tmp = player[roomName];
    io.to(socket.id).emit('players', tmp);
  });
 
    
    
   
  socket.on('joinRoom', function(room) {
    
    var roomName = room.name;

    socket.join(room.name);
    roomArray[roomName][room.nickname] = 0;
    player[roomName] = player[roomName]-1;
    console.log('Player '+room.nickname+' has joined in the  '+room.name );
    console.log( roomArray[roomName]);
    var tmp = player[roomName];
    io.to(roomName).emit('players', tmp);
     
   
  });
  socket.on(socket.id, (msg) => {

    var nick = msg.nickname;
    var roomName = msg.nameRoom;

    roomArray[roomName][nick] =  msg.score;
    
    var tmp = roomArray[roomName];
    io.to(socket.id).emit('message',tmp);
    
  });
  socket.on('disconnect', () => {
    delete point[socket.id];
    
    console.log('user '+socket.id+' disconnected');
  });
});

server.listen(8080);

console.log('Server listening on http://localhost:8080');

