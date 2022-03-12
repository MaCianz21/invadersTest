const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
var numPlayer=0;
app.use(express.static(__dirname + '/public'));
var point={};
var id;
io.on('connection', (socket) => {
  
  numPlayer++;
  
  console.log('user '+socket.id+' connected');
  
  console.log('Number Player: '+numPlayer);
  
});
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});
io.on('connection', (socket) => {
  //console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user '+socket.id+' disconnected');
  });
});
io.on('connection', (socket) => {
  socket.on(socket.id, (msg) => {
    point[socket.id]=msg;
    console.log(point);
    io.emit('message',point);
    
    
    
  });
});
server.listen(8080);
console.log('Server listening on http://localhost:8080');


io.sockets.on('connection', function(socket){
  console.log('socket connection');
});