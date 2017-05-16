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
    //TO DO no text
    var cellElmValue = color === 'white' ? 'W' + cellValue : 'B' + cellValue;
    var cellElmId = 'cell-' + cell + (cell < 5 || cell > 12 ? '-' + color : '-neutral');
    var cellElm = document.getElementById(cellElmId);
    if (cellValue == 0) {
        //remove cell display
        if (cellElm.firstChild)
            cellElm.removeChild(cellElm.firstChild);
    }
    else {
        var innerElm = cellElm.firstChild;
        if (!innerElm) {
            innerElm = document.createElement('span');
            innerElm.style.position = 'absolute';
            innerElm.style.top = '0';
            innerElm.style.bottom = '0';
            innerElm.style.left = '0';
            innerElm.style.right = '0';
            innerElm.style.backgroundSize = 'contain';
            innerElm.style.backgroundRepeat = 'no-repeat';
            cellElm.appendChild(innerElm);
        }
        innerElm.style.backgroundImage = color === 'white' ? 'url(../images/whitepiece_old.png)' : 'url(../images/blackpiece_old.png)';
        innerElm.innerHTML = cellElmValue;
    }
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
    //TO DO asd
    document.getElementById('extra_info').innerHTML = JSON.stringify(msg);
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

    //TO DO wqe
    document.getElementById('game_id').innerHTML = JSON.stringify(gameId);
    document.getElementById('player_color').innerHTML = JSON.stringify(playerColor);
}

var opponentLeft = function (msg) {
    //TO DO zxc
    document.getElementById('extra_info').innerHTML = JSON.stringify(msg);
}

var updateDiceRoll = function (msg) {
    boardState.dice = msg.dice;
    if (msg.endTurn === true)
        boardState.toMove = boardState.toMove === 'white' ? 'black' : 'white';

    //TO DO hgfg
    document.getElementById('dice_value').innerHTML = JSON.stringify(boardState.dice);
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
        if (typeof chk !== 'undefined' && chk.color === playerColor)
            doMove(tokens[1]);
    }
}

var mouseOver = function (cellId) {
    var tokens = cellId.split('-');
    console.log(tokens);
}

var clickableCells = document.getElementsByClassName('cell-click-zone');
for (var i = 0, len = clickableCells.length; i < len; i++) {
    clickableCells[i].addEventListener("click", function () { clickedCell(this.id); });
    clickableCells[i].addEventListener("mouseover", function () { mouseOver(this.id); });
}

