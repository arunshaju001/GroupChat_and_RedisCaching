import express from 'express';
import path from 'path';
import http from 'http';


let io = require('socket.io');
let app = express();
var users = [];

app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'public')));


// Set up express
let server = http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});

// Set up socket.io
io = require('socket.io').listen(server);


// Handle socket traffic
io.sockets.on('connection',  (socket) => {

    
    // Set the nickname property for a given client
    socket.on('nick', (nick) => {
        socket.set('nickname', nick);
        users.push(nick)
        socket.emit('userlist', users);
        socket.broadcast.emit('userlist', users);
    });

   

    // Relay chat data to all clients
    socket.on('chat', (data) => {
        socket.get('nickname', (err, nick) => {
            
            let nickname = err ? 'Anonymous' : nick;
            let datetime = new Date()
            let payload = {
                message: data.message,
                nick: nickname,
                datetime: ''+datetime.toLocaleDateString()+'/'+datetime.toLocaleTimeString()
            };

            socket.emit('chat',payload);
            socket.broadcast.emit('chat', payload);
        });
    });
});


/*
Use of Radium for Media Queries
*/