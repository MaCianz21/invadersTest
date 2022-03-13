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
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
io.on('connection', (socket) => {
  numPlayer++;
  console.log('user '+socket.id+' connected');

  socket.on(socket.id, (msg) => {
    point[socket.id] = msg;
    //console.log(point);
    io.emit('message',point);
  });
  socket.on('disconnect', () => {
    delete point[socket.id];
    console.log('user '+socket.id+' disconnected');
  });
});

server.listen(8080);

console.log('Server listening on http://localhost:8080');

