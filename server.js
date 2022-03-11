const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
var mex;
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {

  res.sendFile(__dirname + '/index.html');
});
io.on('connection', (socket) => {
  console.log('user'+socket.id+'connected');
});
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user '+socket.id+' disconnected');
  });
});
io.on('connection', (socket) => {
  socket.on('score', (msg) => {
    io.emit('message',msg);
    
  });
});
server.listen(8080);
console.log('Server listening on http://localhost:8080');


io.sockets.on('connection', function(socket){
  console.log('socket connection');
  socket.on('update item',function(data){
    console.log('update item' + data.point);
  });
});