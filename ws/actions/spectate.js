'use strict'

var utils = require('../utils');

var spectate = function (sender, msg) {
    if (typeof msg.code !== 'undefined' && msg.code !== null)
        if (typeof global.activeGames[msg.code] !== 'undefined') {
            utils.removeSpectator(sender);
            utils.removeFromWaiting(sender);
            utils.removeFromActive(sender);

            var game = global.activeGames[msg.code];
            sender.urSpectatingGame = msg.code;
            game.spectators.push(sender);
            var resp = {
                action: 'start-spectating',
                body: {
                    id: msg.code,
                    boardState: game.boardState,
                }
            };
            sender.sendUTF(JSON.stringify(resp));
        }
}

exports.spectate = spectate;