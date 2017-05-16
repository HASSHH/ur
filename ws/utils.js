'use strict'

var removeFromWaiting = function (sender) {
    for (var key in global.waitingRoom) {
        var value = global.waitingRoom[key];
        if (sender == value) {
            delete global.waitingRoom[key];
            break;
        }
    }
}

var removeFromActive = function (sender) {
    for (var key in global.activeGames) {
        var value = global.activeGames[key];
        if (sender == value.whitePlayer) {
            value.blackPlayer.sendUTF(JSON.stringify({ action: 'opponent-left' }));
            delete global.activeGames[key];
            break;
        }
        if (sender == value.blackPlayer) {
            value.whitePlayer.sendUTF(JSON.stringify({ action: 'opponent-left' }));
            delete global.activeGames[key];
            break;
        }
    }
}

var checkMove = function (cell, color, id) {
    cell = Number(cell);
    var game = global.activeGames[id];
    if (typeof game !== 'undefined') {
        var boardState = game.boardState;
        if (typeof boardState.dice !== 'undefined')
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

exports.removeFromWaiting = removeFromWaiting;
exports.removeFromActive = removeFromActive;
exports.checkMove = checkMove;