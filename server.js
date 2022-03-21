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
var now;
var current;
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('user '+socket.id+' connected');

  socket.on('createRoom', function(room) {
    
    var roomName = room.name;

    //console.log(roomArray[roomName]);
    
    if(roomArray[roomName]!= undefined)
    {
      io.to(socket.id).emit('checkRoom', 'exist');
      console.log('esisto');
    }
    else
    {
      io.to(socket.id).emit('checkRoom', 'not exist');
      roomArray[roomName] = {};
    }
    
    
    
    if(roomArray[roomName][room.nickname]!= undefined)
    {
      io.to(socket.id).emit('nickname', 'exist');
      
    }
    else
    {
      io.to(socket.id).emit('nickname', 'not exist');
      
      roomArray[roomName][room.nickname] = 0;
      
      player[roomName]=room.numberPlayer -1;
      socket.join(roomName);
      console.log('Room '+roomName+' created  '+numRoom );
      
      var tmp = player[roomName];
      io.to(socket.id).emit('players', tmp);
    }
    
    
  });

  socket.on('joinRoom', function(room) {
    
    var roomName = room.name;

    
    if(roomArray[roomName]!= undefined)
    {
      console.log('room exist');
      io.to(socket.id).emit('checkRoom', 'exist');
      if(roomArray[roomName][room.nickname]!= undefined)
      {
        
        io.to(socket.id).emit('nickname', 'exist');
      }
      else
      {
        if(player[roomName] ===0)
        {
          io.to(socket.id).emit('checkPlayer', 'prohibited');
        }
        else
        {
          io.to(socket.id).emit('checkPlayer', 'permit');
          socket.join(room.name);
          io.to(socket.id).emit('nickname', 'not exist');
          roomArray[roomName][room.nickname] = 0;
          player[roomName] = player[roomName]-1;
          console.log('Player '+room.nickname+' has joined in the  '+room.name );
          console.log( roomArray[roomName]);
          var tmp = player[roomName];
          io.to(roomName).emit('players', tmp);
        }
       
      }
    }
    else
    {
      console.log('room not exist');
      io.to(socket.id).emit('checkRoom', 'not exist');
    }
    
  });

  socket.on('mex', (msg) => {
    var mes={};
    now = new Date();
    current = now.getHours() + ':' + now.getMinutes();
    mes.nickname = msg.nickname;
    mes.mex=msg.mex;
    mes.time=current;

    io.emit('response',mes);
  });

  
  socket.on('userJoin', (msg) => {
    var mes={};
    now = new Date();
    current = now.getHours() + ':' + now.getMinutes();
    mes.nickname = msg.nickname;
    mes.mex=("joined the global chat");
    mes.time=current;

    io.sockets.emit('response',mes);
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