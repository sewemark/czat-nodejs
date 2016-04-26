var express= require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var  rooms = new Array();
rooms.push('room1');
rooms.push('room2');

var usersInRooms = new Array();
var messagesInRoom = new Array();
var applicationUsers = new Array();
usersInRooms['room1'] =  new Array();
usersInRooms['room2'] =  new Array();

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function(req, res){

    res.sendFile(__dirname + '/index.html');
});

app.get('/styles.css', function(req, res){

    res.sendFile(__dirname + '/styles.css');
});


var roomName;

io.on('connection', function(socket){
    socket.on('chat message', function(msg){

        var index = msg.indexOf('#');
        if(index >0){
          roomName = msg.substr(0,index);
        }

        socket.join(roomName);
        var mess = msg.substr(index + 1, msg.length);

        if(!messagesInRoom[roomName])
            messagesInRoom[roomName] =  new Array();
        messagesInRoom[roomName].push(mess);
        io.sockets.in(roomName).emit('chat message', msg);
    });

    socket.on('user connection', function(msg){
        applicationUsers.push(msg);
        io.emit('application users', applicationUsers);
        io.emit('rooms', rooms);
    });

    socket.on('join room', function(msg){
        var roomMessages = new Array();
        roomMessages.push("message1");
        roomMessages.push("message2");
        var object = JSON.parse(msg);
        console.log("peron what to join room : " + object.nick);
        if(!usersInRooms[object.room]){
            usersInRooms[object.room] = new Array();
        }
        else{
            usersInRooms[object.room].push(object.nick);
        }
        if(!messagesInRoom[object.room]){
            messagesInRoom[object.room]   =  new Array();
        }
        var responseObject = {
            roomMessages:messagesInRoom[object.room],
            users: usersInRooms[object.room]
        };
        socket.join(object.room);
        io.sockets.in(object.room).emit('users in room', usersInRooms[object.room]);
        io.emit('room messages',JSON.stringify(responseObject));
    });

    socket.on('create room', function(msg){
        rooms.push(msg);
        io.emit('rooms', rooms);
     });
    socket.on('leave room', function(msg){
        var objectMsg = JSON.parse(msg);
        var users = usersInRooms[objectMsg.room];
        var index= usersInRooms[objectMsg.room].indexOf(objectMsg.nick);
        if(index>=  0)
        {
            usersInRooms[objectMsg.room].splice(index,  1);
        }
        io.emit('rooms', rooms);
         socket.leave(objectMsg.room);
         io.sockets.in(objectMsg.room).emit('users in room', usersInRooms[objectMsg.room]);

    });

});
http.listen(3000, function(){
    console.log('listening on *:3000');
});