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
        console.log("room joineddd");
        console.log(roomName);
        socket.join(roomName);
        var mess = msg.substr(index + 1, msg.length);
        console.log(msg);
        console.log(mess);
        if(!messagesInRoom[roomName])
            messagesInRoom[roomName] =  new Array();
        messagesInRoom[roomName].push(mess);
        io.sockets.in(roomName).emit('chat message', msg);
    });

    socket.on('user connection', function(msg){
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
        io.emit('room messages',JSON.stringify(responseObject));
    });

    socket.on('create room', function(msg){
        rooms.push(msg);
        rooms.push()
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
        console.log(objectMsg.room);
        console.log('idzie zmiana userow');
        var clients = io.sockets.adapter.rooms['room1'];
        console.log(clients);
        console.log(usersInRooms[objectMsg.room]);
        socket.leave(objectMsg.room);
        //socket.join(objectMsg.room);
        //socket.broadcast.to('room1').emit(usersInRooms['room1']);
          //io.sockets.emit('', usersInRooms[objectMsg.room]);
         io.sockets.in(objectMsg.room).emit('users in room', usersInRooms[objectMsg.room]);
        //    io.sockets.in(roomName).emit('users in room', usersInRooms[objectMsg.room]);
        //io.sockets.in(roomName).emit('chat message', msg);
    });

});
http.listen(3000, function(){
    console.log('listening on *:3000');
});