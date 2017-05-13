'use strict'

global.waitingRoom = {};
global.activeGames = {};

var webSocketServer = require('websocket').server;

var newGameAction = require('./actions/newgame').newGame;
var joinGameAction = require('./actions/joingame').joinGame;

var wsServer = new webSocketServer({
    httpServer: httpserver,
    autoAcceptConnections: false
});

wsServer.on('request', function (request) {
    var connection = request.accept('ur-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function (message) {
        console.log(message.utf8Data);
        var msg = JSON.parse(message.utf8Data);
        switch (msg.action) {
            case 'start-new-game':
                console.log('before waiting');
                for (var key in global.waitingRoom)
                    console.log(key);
                newGameAction(connection, msg.body);
                console.log('after');
                for (var key in global.waitingRoom)
                    console.log(key);
                break;
            case 'join-game':
                console.log('before active');
                for (var key in global.activeGames)
                    console.log(key);
                joinGameAction(connection, msg.body);
                console.log('after');
                for (var key in global.activeGames)
                    console.log(key);
                break;
            default:
                break;
        }
    });
    connection.on('close', function (reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        for (var key in global.waitingRoom) {
            var value = global.waitingRoom[key];
            if (connection == value)
            {
                delete global.waitingRoom[key];
                break;
            }
        }
        for (var key in global.activeGames) {
            var value = global.activeGames[key];
            if (connection == value.whitePlayer) {
                value.blackPlayer.sendUTF(JSON.stringify({ action: 'opponent-left' }));
                delete global.activeGames[key];
                break;
            }
            if (connection == value.blackPlayer) {
                value.whitePlayer.sendUTF(JSON.stringify({ action: 'opponent-left' }));
                delete global.activeGames[key];
                break;
            }
        }
    });
});