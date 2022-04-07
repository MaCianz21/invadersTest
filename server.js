const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
var player={};
var nickChat={};
app.use(express.static(__dirname + '/public'));
var roomArray={};//memorize the scores of the players in the different rooms
var now;
var current;
var playerDelete={};
var playerSocketID={};


app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
	console.log('user '+socket.id+' connected');

  socket.on('createRoom', function(room) {
    var roomName = room.name;
    if(roomArray[roomName]!= undefined)
    {
      io.to(socket.id).emit('checkRoom', 'exist');
      console.log('esisto');
    }
    else
    {
      io.to(socket.id).emit('checkRoom', 'not exist');
      roomArray[roomName] = {};
      player[roomName] = {};
      if(roomArray[roomName][room.nickname]!= undefined)
      {
        io.to(socket.id).emit('nickname', 'exist');
      }
      else
      {
        io.to(socket.id).emit('nickname', 'not exist');
       
       
        roomArray[roomName][room.nickname] = 0;
        
        player[roomName][room.nickname] = 0;
        player[roomName].players = room.numberPlayer -1;

        playerSocketID[socket.id] = room.nickname;

        socket.join(roomName);
        console.log('Room '+roomName+' created ='+player[roomName].players);
        
        var tmp = player[roomName].players;
        console.log('lalala'+tmp);
        io.to(socket.id).emit('players', tmp);
      }
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
        console.log(player[roomName]);
        if(player[roomName].players === 0)
        {
          io.to(socket.id).emit('checkPlayer', 'prohibited');
        }
        else
        {
          console.log(roomArray);
          io.to(socket.id).emit('checkPlayer', 'permit');
          socket.join(room.name);
          io.to(socket.id).emit('nickname', 'not exist');
          roomArray[roomName][room.nickname] = 0;
          player[roomName].players -= 1;
          playerSocketID[socket.id] = room.nickname;
          
          player[roomName][room.nickname] = 0;

          console.log('Player '+room.nickname+' has joined in '+room.name );
          var tmp = player[roomName].players;
          
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
    console.log(mes);
    io.emit('chat_update',mes);
  });

  socket.on('gameStart', (data) => {
    var roomName = data.name;
    console.log("SOckets");
    console.log(playerSocketID);
    //player[roomName].players = Object.keys(roomArray[roomName]).length;
  });
  
  socket.on('userJoin', (msg) => {
    var mes={};
    now = new Date();
    var nickname=msg.nickname;
    playerDelete[socket.id]=nickname;
    current = now.getHours() + ':' + now.getMinutes();
    if(nickChat[nickname] != undefined){
      console.log('exist');
      io.sockets.emit('chat_update','exist');
    }
    else
    {
      nickChat[nickname]=nickname;
      console.log('not exist');
      mes.nickname = nickChat[nickname];
     
      mes.mex=("joined the global chat");
      mes.time=current;
      io.sockets.emit('chat_update',mes);
    }
  });
  
  socket.on('playerGameOver',function(data){
      if(player.hasOwnProperty(data.nameRoom)){
        delete player[data.nameRoom];
      }
      if(roomArray.hasOwnProperty(data.nameRoom)){
        delete roomArray[data.nameRoom];
      }
  });

  socket.on(socket.id, (msg) => {

    var nick = msg.nickname;
    var roomName = msg.nameRoom;

    roomArray[roomName][nick] =  msg.score;
    
    var tmp = roomArray[roomName];
    io.to(socket.id).emit('message',tmp);
    
  });
  socket.on('displayLB', (msg) => {
    console.log(roomArray);
    var roomName = msg.name;
    var tmp = {};
    tmp["roomCapacity"] = Object.keys(roomArray[roomName]).length;
    io.to(socket.id).emit('displayLB_response',tmp);
  });

  socket.on('playerFinish', (data) => {
    console.log(data);
    var roomName = data.roomName;
    var nickname = data.nickname;

    var tmp = false;

    if(player[roomName].hasOwnProperty(nickname)){
      delete player[roomName][nickname];
    }
    
    if(Object.keys(player[roomName]).length == 1){
      tmp = true;
      io.to(roomName).emit('roomFinish', tmp);
    }
  });
  
  socket.on('disconnect', () => {
    //deletes from the player array the user that disconnected
    for(room in player){
      if(player[room].hasOwnProperty(playerSocketID[socket.id])){
         delete player[room][playerSocketID[socket.id]];
      }
      if(Object.keys(player[room]).length == 1){
        if(player.hasOwnProperty(room)){
          delete player[room];
        }
        if(roomArray.hasOwnProperty(room)){
          delete roomArray[room];
        }
      }
    }

    for(var key in playerDelete)
    {
        if(key == socket.id)
        {
          delete nickChat[playerDelete[key]];
        }
    }
    console.log('user '+socket.id+' disconnected');
  });
});

server.listen(process.env.PORT || 8080);

console.log('Server listening on http://localhost:8080');