'use strict'

var utils = require('../utils');

var rematch = function (sender, msg) {
    if (typeof msg.id !== 'undefined' && msg.id !== null) {
        var game = global.activeGames[msg.id];
        if (typeof game !== 'undefined' && game.boardState == null && (typeof sender.calledRematch === 'undefined' || sender.calledRematch == false)) {
            sender.calledRematch = true;
            if (game.whitePlayer.calledRematch && game.blackPlayer.calledRematch) {
                //swap collors
                var swapVar = game.whitePlayer;
                game.whitePlayer = game.blackPlayer;
                game.blackPlayer = swapVar;
                //re-initialize boardstate
                game.boardState = {
                    toMove: 'white',
                    whitePieces: [7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    blackPieces: [7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                }
                var resp = {
                    action: 'game-started',
                    body: {
                        id: game.id
                    }
                };
                //notify white player
                resp.body.color = 'white';
                game.whitePlayer.sendUTF(JSON.stringify(resp));
                //notify black player
                resp.body.color = 'black';
                game.blackPlayer.sendUTF(JSON.stringify(resp));
                //clear rematch flag
                game.whitePlayer.calledRematch = false;
                game.blackPlayer.calledRematch = false;

                //send to all spectators
                var spectatorResp = {
                    action: 'start-spectating',
                    body: {
                        id: game.id,
                        boardState: game.boardState,
                    }
                };
                var specCount = game.spectators.length;
                for (var i = 0; i < specCount; ++i)
                    game.spectators[i].sendUTF(JSON.stringify(spectatorResp));
            }
        }
    }
}

exports.rematch = rematch;