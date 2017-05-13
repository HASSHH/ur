var socket = new WebSocket('ws://localhost:1337', 'ur-protocol');

var waitForGame = function (msg) {
    document.getElementById('extra_info').innerHTML = JSON.stringify(msg);
}

var gameStarted = function (msg) {
    document.getElementById('extra_info').innerHTML = JSON.stringify(msg);
}

var opponentLeft = function (msg) {
    document.getElementById('extra_info').innerHTML = JSON.stringify(msg);
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
        default:
            break;
    }
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