var socket = new WebSocket('wss://the-royal-game-of-ur.herokuapp.com/', 'ur-protocol');
var gameId;
var boardState = {};


var gameEnded = function (victor) {
    boardState = {};
    notifyVictory(victor);
}


var updateCellDOM = function (cell, color) {
    cell = Number(cell);
    var cellValue = color === 'white' ? boardState.whitePieces[cell] : boardState.blackPieces[cell];
    var cellElmId = 'cell-' + cell + (cell < 5 || cell > 12 ? '-' + color : '-neutral');
    var cellElm = document.getElementById(cellElmId);
    var innerElm = cellElm.firstChild;
    if (cellValue == 0) {
        //remove cell display
        innerElm.style.backgroundImage = null;
    }
    else {
        var rotationAngle = Math.floor((Math.random() * 360));
        innerElm.style.backgroundImage = color === 'white' ? 'url(/images/whitepiece_old.png)' : 'url(/images/blackpiece_old.png)';
        innerElm.style.transform = 'rotate(' + rotationAngle + 'deg)';
        if (cell === 0 || cell === 15) {
            if (!innerElm.firstChild) {
                var spanText = document.createElement('span');
                innerElm.appendChild(spanText);
            }
            innerElm.firstChild.innerHTML = cellValue;
            var rotationAngleCorrection = -rotationAngle;
            //correct rotation AFTER centering text
            innerElm.firstChild.style.transform = 'translateY(-50%) rotate(' + rotationAngleCorrection + 'deg)';
        }
    }
}

var spectateGame = function (msg) {
    gameId = msg.id;
    boardState = msg.boardState;
    for (var i = 0; i < 16; ++i) {
        if (i > 4 && i < 13)
            if (boardState.whitePieces[i] > 0)
                updateCellDOM(i, 'white');
            else
                updateCellDOM(i, 'black');
        else {
            updateCellDOM(i, 'white');
            updateCellDOM(i, 'black');
        }
    }
    if (typeof boardState.dice !== 'undefined')
        document.getElementById('dice-value').innerHTML = 'Dice value: ' + boardState.dice;
    else
        document.getElementById('dice-value').innerHTML = '';
    document.getElementById('game-id').innerHTML = 'Spectating game ' + gameId;
    notifyPlayerColor(boardState.toMove);
}

var updateDiceRoll = function (msg) {
    boardState.dice = msg.dice;
    if (msg.endTurn === true) {
        boardState.toMove = boardState.toMove === 'white' ? 'black' : 'white';
        delete boardState.dice;
        notifyPlayerColor(boardState.toMove);
    }

    //TO DO hgfg
    var diceElm = document.getElementById('dice-value');
    fadeout(diceElm, function () {
        diceElm.innerHTML = 'Dice value: ' + msg.dice;
        fadein(diceElm, null);
    });
}

var updateWithMove = function (msg) {
    var ours, theirs;
    if (boardState.toMove === 'white') {
        ours = boardState.whitePieces;
        theirs = boardState.blackPieces;
    }
    else {
        ours = boardState.blackPieces;
        theirs = boardState.whitePieces;
    }
    --ours[msg.start];
    ++ours[msg.stop];
    if (msg.stop > 4 && msg.stop < 13 && theirs[msg.stop] > 0) {
        --theirs[msg.stop];
        ++theirs[0];
        updateCellDOM(0, boardState.toMove === 'white' ? 'black' : 'white');
    }
    updateCellDOM(msg.start, boardState.toMove);
    updateCellDOM(msg.stop, boardState.toMove);
    boardState.toMove = msg.nextToMove;
    delete boardState.dice;

    if (boardState.whitePieces[15] == 7)
        gameEnded('white');
    else if (boardState.blackPieces[15] == 7)
        gameEnded('black');
    //else we notify who's next to move
    else
        notifyPlayerColor(boardState.toMove);
}

//From ws server
socket.onmessage = function (message) {
    var msg = JSON.parse(message.data);
    switch (msg.action) {
        case 'start-spectating':
            spectateGame(msg.body);
            break;
        case 'update-dice-roll':
            updateDiceRoll(msg.body);
            break;
        case 'update-with-move':
            updateWithMove(msg.body);
            break;
        default:
            break;
    }
}

//To server
var spectate = function (code) {
    var msg = {
        action: 'spectate',
        body: {
            code: code
        }
    };
    socket.send(JSON.stringify(msg));
}

//
var startSpectating = function (code) {
    if (socket.readyState === socket.OPEN)
        spectate(code);
    else
        socket.onopen = function () {
            spectate(code);
        }
}

//notifications messages
var notifyPlayerColor = function (color) {
    var tbd = document.getElementById('top-board-display');
    while (tbd.lastChild)
        tbd.removeChild(tbd.lastChild);
    var message = document.createElement('h2');
    message.innerHTML = 'It\'s ' + color + ' player\'s turn.';
    tbd.appendChild(message);
}
var notifyVictory = function (color) {
    var tbd = document.getElementById('top-board-display');
    while (tbd.lastChild)
        tbd.removeChild(tbd.lastChild);
    var message = document.createElement('h2');
    message.innerHTML = color + ' is victorious.';
    tbd.appendChild(message);
}

// ------------------------------- //
// ---- NOT GAMEPLAY RELATED ----- //
// ------------------------------- //

function fadeout(element, callback) {
    var op = 1;  // initial opacity
    element.style.opacity = op;
    element.style.filter = 'alpha(opacity=' + op * 100 + ")";
    var timer = setInterval(function () {
        if (op <= 0.1) {
            clearInterval(timer);
            element.style.display = 'none';
            if (callback)
                callback();
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op -= op * 0.1;
    }, 20);
}

function fadein(element, callback) {
    var op = 0.05;  // initial opacity
    element.style.opacity = op;
    element.style.filter = 'alpha(opacity=' + op * 100 + ")";
    element.style.display = 'block';
    var timer = setInterval(function () {
        if (op >= 1) {
            clearInterval(timer);
            if (callback)
                callback();
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op += op * 0.05;
    }, 5);
}