var socket = new WebSocket('ws://ur-ur.1d35.starter-us-east-1.openshiftapps.com/', 'ur-protocol');
var gameId, playerColor;
var boardState = {};


var gameEnded = function (victor) {
    boardState = {};
    gameId = undefined;
    playerColor = undefined;

    //TO DO
    document.getElementById('extra_info').innerHTML = victor + ' victory';
}


var updateCellDOM = function(cell, color){
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
        innerElm.style.backgroundImage = color === 'white' ? 'url(../images/whitepiece_old.png)' : 'url(../images/blackpiece_old.png)';
        innerElm.style.transform = 'rotate(' + rotationAngle + 'deg)';
        if (cell === 0 || cell === 15) {
            if (!innerElm.firstChild) {
                var spanText = document.createElement('span');
                innerElm.appendChild(spanText);
            }
            innerElm.firstChild.innerHTML = cellValue;
            var rotationAngleCorrection = -rotationAngle;
            if (playerColor === 'black')
                rotationAngleCorrection += 180;
            //correct rotation AFTER centering text
            innerElm.firstChild.style.transform = 'translateY(-50%) rotate(' + rotationAngleCorrection + 'deg)';
        }
    }
}

var markedCellList = [];

var markCell = function (cellId, markingColor) {
    document.getElementById(cellId).style.backgroundImage = markingColor === 'green' ? 'url(../images/green_hl.png)' : 'url(../images/red_hl.png)';
}

var markCellTarget = function (cellId) {
    document.getElementById(cellId).style.backgroundImage = 'url(../images/green_target.png)';
}

var unmarkCell = function (cellId) {
    document.getElementById(cellId).style.backgroundImage = null;
}

var initBoardState = function () {
    boardState.toMove = 'white';
    boardState.whitePieces = [7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    boardState.blackPieces = [7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (var i = 0; i < 16; ++i) {
        updateCellDOM(i, 'white');
        updateCellDOM(i, 'black');
    }
}

var waitForGame = function (msg) {
    document.getElementById('game-code-display').innerHTML = msg.code;
    showWaitingDiv();
}

var gameStarted = function (msg) {
    gameId = msg.id;
    playerColor = msg.color;

    var board = document.getElementById('board');
    if (playerColor === 'black')
        board.style.transform = 'rotate(180deg)';
    else
        board.style.transform = null;

    initBoardState();
    
    document.getElementById('game-id').innerHTML = 'Game ID: ' + gameId;
    showBoardDiv();
}

var opponentLeft = function (msg) {
    gameEnded('disconnected');
}

var updateDiceRoll = function (msg) {
    boardState.dice = msg.dice;
    if (msg.endTurn === true)
        boardState.toMove = boardState.toMove === 'white' ? 'black' : 'white';

    //TO DO hgfg
    document.getElementById('dice-value').innerHTML = 'Dice value: ' + boardState.dice;
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
    //TO DO maybe tell who is to move... or highlight roll dice button etc
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
        case 'update-with-move':
            updateWithMove(msg.body);
            break;
        case 'opponent-left':
            opponentLeft(msg.body);
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
    var code = document.getElementById('join-game-code').value;
    var msg = {
        action: 'join-game',
        body: {
            code: code
        }
    };
    socket.send(JSON.stringify(msg));
}

var doMove = function (move) {
    var msg = {
        action: 'do-move',
        body: {
            id: gameId,
            cell: move
        }
    };
    socket.send(JSON.stringify(msg));
}

//Other
var checkMove = function (cell, color) {
    cell = Number(cell);
    if (typeof boardState.dice !== 'undefined') {
        //if valid color
        if (boardState.toMove === color || cell > 4 && cell < 13) {
            var actualColor = color;
            if (actualColor === 'neutral')
                if (boardState.whitePieces[cell] > 0)
                    actualColor = 'white';
                else
                    actualColor = 'black';
            var ours, theirs;
            if (actualColor === 'white') {
                ours = boardState.whitePieces;
                theirs = boardState.blackPieces;
            }
            else {
                ours = boardState.blackPieces;
                theirs = boardState.whitePieces;
            }
            //check if there is a piece on that position
            if (ours[cell] > 0) {
                var endSquare = cell + Number(boardState.dice);
                //not to go over & no friendly piece there unless it's square 15
                if (endSquare == 15 || endSquare < 15 && ours[endSquare] == 0)
                    //not square 8 if enemy is there
                    if (endSquare != 8 || theirs[endSquare] == 0) {
                        return { endSquare: endSquare, color: actualColor };
                    }
            }
        }
    }
}

var clickedCell = function (cellId) {
    if (playerColor === boardState.toMove) {
        var tokens = cellId.split('-');
        var chk = checkMove(tokens[1], tokens[2]);
        if (typeof chk !== 'undefined' && chk.color === playerColor) {
            mouseOutCell(cellId);
            var markRed = chk.color === 'white' ? (boardState.whitePieces[Number(tokens[1])] > 1) : (boardState.blackPieces[Number(tokens[1])] > 1);
            if (markRed) {
                markCell(cellId, 'red');
                markedCellList.push(cellId);
            }
            doMove(tokens[1]);
        }
    }
}

var mouseOverCell = function (cellId) {
    var tokens = cellId.split('-');
    var cellInd = Number(tokens[1]);
    if (typeof boardState.toMove !== 'undefined'
        && typeof boardState.whitePieces !== 'undefined'
        && typeof boardState.blackPieces !== 'undefined'
        && (boardState.whitePieces[cellInd] > 0 || boardState.blackPieces[cellInd] > 0)) {

        if (cellInd < 5 || cellInd > 12) {
            if (tokens[2] === 'white' && boardState.whitePieces[cellInd] == 0)
                return;
            if (tokens[2] === 'black' && boardState.blackPieces[cellInd] == 0)
                return;
        }
        markedCellList.push(cellId);
        var pieceColor = tokens[2] !== 'neutral' ? tokens[2] : (boardState.whitePieces[cellInd] > 0 ? 'white' : 'black');
        if (playerColor === pieceColor && playerColor === boardState.toMove && typeof boardState.dice !== 'undefined') {
            var chk = checkMove(tokens[1], tokens[2]);
            if (typeof chk !== 'undefined') {
                markCell(cellId, 'green');
                var targetCellPieceColor = chk.endSquare > 4 && chk.endSquare < 13 ? 'neutral' : pieceColor;
                var targetCellId = tokens[0] + '-' + chk.endSquare + '-' + targetCellPieceColor;
                markCellTarget(targetCellId);
                markedCellList.push(targetCellId);
            }
            else
                markCell(cellId, 'red');
        }
        else
            markCell(cellId, 'red');
    }
}

var mouseOutCell = function (cellId) {
    while (markedCellList.length > 0)
        unmarkCell(markedCellList.pop());
}

var clickableCells = document.getElementsByClassName('cell-click-zone');
for (var i = 0, len = clickableCells.length; i < len; i++) {
    clickableCells[i].addEventListener("click", function () { clickedCell(this.id); });
    clickableCells[i].addEventListener("mouseover", function () { mouseOverCell(this.id); });
    clickableCells[i].addEventListener("mouseout", function () { mouseOutCell(this.id); });
}

// ------------------------------- //
// ---- NOT GAMEPLAY RELATED ----- //
// ------------------------------- //


var activeElm = document.getElementById("intro-div");
var showBoardDiv = function () {
    var old = activeElm;
    activeElm = document.getElementById("board-div");
    fadeout(old, function () {
        fadein(activeElm, null);
    });
}
var showWaitingDiv = function () {
    var old = activeElm;
    activeElm = document.getElementById("waiting-div");
    fadeout(old, function () {
        fadein(activeElm, null);
    });
}
var showJoinDiv = function () {
    var old = activeElm;
    activeElm = document.getElementById("join-div");
    fadeout(old, function () {
        fadein(activeElm, null);
    });
}

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