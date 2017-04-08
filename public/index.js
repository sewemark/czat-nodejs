'use strict'
var express= require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var  rooms = new Array();
var tempRooms = new Array();
var Room = require('./models/room');
var ClientContract = require('./models/clientcontract');
var ServerContract = require('./models/servercontract');

var room1 =  new Room('room1');
var room2 =  new Room('room2');
var clientContract =  new ClientContract();
var serverContract =  new ServerContract();
rooms.push(room1);
rooms.push(room2);
var applicationUsers = new Array();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.get('/styles.css', function(req, res){
    res.sendFile(__dirname + '/styles.css');
});

io.on(clientContract.CONNECTION, function(socket){

    socket.on(serverContract.BROADCAST_MESSAGES, function(msg){
        var requestObject =JSON.parse(msg);
        socket.join(requestObject.roomName);
        var currentRoom = getCurrentRoom(requestObject.roomName);
        currentRoom.messages.push(requestObject.message);
        io.sockets.in(requestObject.roomName).emit(serverContract.BROADCAST_MESSAGES, requestObject.message);
    });

    socket.on(clientContract.USERCONNECTION, function(msg){
        applicationUsers.push(msg);
        io.emit(serverContract.BROADCAST_APPLICATIONUSES, applicationUsers);
        io.emit(serverContract.BROADCAST_ROOMS, rooms.map(function(item){
            return item.name;
        }));
    });

    socket.on(clientContract.JOIN_ROOM, function(msg){
        var object = JSON.parse(msg);
        console.log("peron what to join room : " + object.nick);
        var currentRoom = getCurrentRoom(object.room);
        currentRoom.users.push(object.nick);
        var responseObject = {
            roomMessages:currentRoom.messages,
            users: currentRoom.users
        };
        socket.join(object.room);
        io.sockets.in(object.room).emit(serverContract.BROADCAST_USERS, currentRoom.users);
        io.emit(serverContract.BROADCAST_MESSAGES,JSON.stringify(responseObject));
    });

    socket.on(clientContract.CREATE_ROOM, function(msg){
        var newRoom =  new Room(msg);
        rooms.push(newRoom);
        io.emit(serverContract.BROADCAST_ROOMS, rooms.map(function(item){
            return item.name;
        }));
     });

    socket.on(clientContract.LEAVE_ROOM, function(msg){
        var objectMsg = JSON.parse(msg);
        var currentRoom = getCurrentRoom(objectMsg.room);
        var index= currentRoom.users.indexOf(objectMsg.nick);
        if(index>=  0)
        {
            currentRoom.users.splice(index,  1);
        }
        io.emit(serverContract.BROADCAST_ROOMS, rooms.map(function(item){
            return item.name;
        }));
         socket.leave(objectMsg.room);
         io.sockets.in(objectMsg.room).emit(serverContract.BROADCAST_USERS, currentRoom.users);

    });

    function  getCurrentRoom(roomName){
        return rooms.filter(function(element){
            return element.name===roomName;
        })[0];
    }

});

http.listen(3000, function(){
    console.log('listening on *:3000');
});