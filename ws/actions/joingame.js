'use strict'

var utils = require('../utils');

var joinGame = function (sender, msg) {
    if (typeof msg.code !== 'undefined' && msg.code !== null)
        if (typeof global.waitingRoom[msg.code] !== 'undefined' && global.waitingRoom[msg.code] != sender) {
            var host = global.waitingRoom[msg.code];
            //remove host from active or waiting
            utils.removeFromWaiting(host);
            utils.removeFromActive(host);
            //if the client that joins has a game in the waiting room or is an active game remove those entries and notify the opponenet if it's the case
            utils.removeFromWaiting(sender);
            utils.removeFromActive(sender);

            var rn = Math.floor((Math.random() * 2));
            var wp, bp;
            if (rn == 0) {
                wp = sender;
                bp = host;
            }
            else {
                wp = host;
                bp = sender;
            }
            var newGame = {
                spectators: [],
                id: msg.code,
                whitePlayer: wp,
                blackPlayer: bp,
                boardState: {
                    toMove: 'white',
                    whitePieces: [7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    blackPieces: [7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                }
            }
            //add game to spectating list
            global.spectateGameList[msg.code] = { started: Date.now() };
            //add game to active game list
            global.activeGames[msg.code] = newGame;
            sender.urActiveGame = msg.code;
            host.urActiveGame = msg.code;
            var resp = {
                action: 'game-started',
                body: {
                    id: msg.code.toString()
                }
            };
            //notify white player
            resp.body.color = 'white';
            newGame.whitePlayer.sendUTF(JSON.stringify(resp));
            //notify black player
            resp.body.color = 'black';
            newGame.blackPlayer.sendUTF(JSON.stringify(resp));
            //clear rematch flag
            newGame.whitePlayer.calledRematch = false;
            newGame.blackPlayer.calledRematch = false;
        }
}

exports.joinGame = joinGame;