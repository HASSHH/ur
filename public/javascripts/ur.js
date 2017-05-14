var socket = new WebSocket('ws://localhost:1337', 'ur-protocol');
var gameId, playerColor;
var boardState = {};

var waitForGame = function (msg) {
    document.getElementById('extra_info').innerHTML = JSON.stringify(msg);
}

var gameStarted = function (msg) {
    gameId = msg.id;
    playerColor = msg.color;
    boardState.toMove = 'white';

    document.getElementById('game_id').innerHTML = JSON.stringify(gameId);
    document.getElementById('player_color').innerHTML = JSON.stringify(playerColor);
}

var opponentLeft = function (msg) {
    document.getElementById('extra_info').innerHTML = JSON.stringify(msg);
}

var updateDiceRoll = function (msg) {
    boardState.dice = msg.dice;

    document.getElementById('dice_value').innerHTML = JSON.stringify(boardState.dice);
}

//From ws server
socket.onmessage = function (message) {
    document.getElementById('output_p').innerHTML = message.data;
    var msg = JSON.parse(message.data);
    switch (msg.action) {
        case 'wait-for-game':
            waitForGame(msg.body);
            break;
        case 'game-started':
            gameStarted(msg.body);
            break;
        case 'update-dice-roll':
            updateDiceRoll(msg.body);
            break;
        default:
            break;
    }
}

//To server
var rollDice = function () {
    if (typeof boardState.toMove !== 'undefined' && typeof playerColor !== 'undefined' && typeof gameId !== 'undefined')
        if(playerColor === boardState.toMove)
            socket.send(JSON.stringify({ action: 'roll-dice', body: { id: gameId } }));
}

var startNewGame = function () {
    socket.send(JSON.stringify({ action: 'start-new-game' }));
}

var joinGame = function () {
    var code = document.getElementById('join_game_code').value;
    var msg = {
        action: 'join-game',
        body: {
            code: code
        }
    };
    socket.send(JSON.stringify(msg));
}

//Other
var clickedCell = function (cell, color) {
    console.log('clicked ' + cell + ' ' + color);
}