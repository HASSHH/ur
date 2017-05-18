'use strict'

var removeFromWaiting = function (sender) {
    if (typeof sender.urWaitingGame !== 'undefined') {
        delete global.waitingRoom[sender.urWaitingGame];
        delete sender.urWaitingGame;
    }
}

var removeFromActive = function (sender) {
    if (typeof sender.urActiveGame !== 'undefined') {
        var key = sender.urActiveGame;
        var value = global.activeGames[key];
        var opponent;
        if (sender == value.whitePlayer)
            opponent = value.blackPlayer;
        else
            opponent = value.whitePlayer;

        delete global.activeGames[key];
        delete sender.urActiveGame;
        delete opponent.urActiveGame;
        opponent.sendUTF(JSON.stringify({ action: 'opponent-left' }));
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