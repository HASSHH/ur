'use strict'

global.waitingRoom = {};
global.activeGames = {};

var webSocketServer = require('websocket').server;
var utils = require('./utils');

var newGameAction = require('./actions/newgame').newGame;
var joinGameAction = require('./actions/joingame').joinGame;
var rollDiceAction = require('./actions/rolldice').rollDice;
var doMoveAction = require('./actions/domove').doMove;

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
                newGameAction(connection, msg.body);
                break;
            case 'join-game':
                joinGameAction(connection, msg.body);
                break;
            case 'roll-dice':
                rollDiceAction(connection, msg.body);
                break;
            case 'do-move':
                doMoveAction(connection, msg.body);
                break;
            default:
                break;
        }
    });
    connection.on('close', function (reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        utils.removeFromWaiting(connection);
        utils.removeFromActive(connection);
    });
});