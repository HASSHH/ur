'use strict'

var utils = require('../utils');

var executeMove = function (start, stop, color, id) {
    var boardState = global.activeGames[id].boardState;
    var ours, theirs;
    if (color === 'white') {
        ours = boardState.whitePieces;
        theirs = boardState.blackPieces;
    }
    else {
        ours = boardState.blackPieces;
        theirs = boardState.whitePieces;
    }
    --ours[start];
    ++ours[stop];
    if (stop > 4 && stop < 13 && theirs[stop] > 0) {
        --theirs[stop];
        ++theirs[0];
    }
}

var doMove = function (sender, msg) {
    if (typeof msg.cell !== 'undefined' && msg.cell !== null
        && typeof msg.id !== 'undefined' && msg.id !== null) {
        var game = global.activeGames[msg.id];
        if (typeof game !== 'undefined' && game.boardState != null) {
            var bs = game.boardState;
            var color;
            var opponent;
            if (bs.toMove === 'white' && game.whitePlayer == sender) {
                color = 'white';
                opponent = game.blackPlayer;
            }
            else if (bs.toMove === 'black' && game.blackPlayer == sender) {
                color = 'black'
                opponent = game.whitePlayer;
            }
            else
                return;
            if (color !== bs.toMove)
                return;
            var moveResult = utils.checkMove(msg.cell, color, msg.id);
            if (moveResult) {
                //if piece ends on cell 4, 8 or 14 player gets another turn
                if (moveResult.endSquare != 4 && moveResult.endSquare != 8 && moveResult.endSquare != 14)
                    bs.toMove = bs.toMove === 'white' ? 'black' : 'white';
                var resp = {
                    action: 'update-with-move',
                    body: {
                        start: Number(msg.cell),
                        stop: moveResult.endSquare,
                        nextToMove: bs.toMove
                    }
                };
                executeMove(msg.cell, moveResult.endSquare, color, msg.id);
                delete bs.dice;
                //if game is over clear boardState to prepare for a possible rematch
                if (bs.whitePieces[15] == 7 || bs.blackPieces[15] == 7) {
                    game.boardState = null;
                }
                sender.sendUTF(JSON.stringify(resp));
                opponent.sendUTF(JSON.stringify(resp));
                //send to all spectators
                var specCount = game.spectators.length;
                for (var i = 0; i < specCount; ++i)
                    game.spectators[i].sendUTF(JSON.stringify(resp));
            }
        }
    }
}

exports.doMove = doMove;