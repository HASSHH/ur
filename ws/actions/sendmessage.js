'use strict'

var utils = require('../utils');

var sendMessage = function (sender, msg) {
    if (typeof msg.text !== 'undefined' && msg.text !== null
        && typeof msg.id !== 'undefined' && msg.id !== null) {
        var game = global.activeGames[msg.id];
        if (typeof game !== 'undefined') {
            var opponent;
            if (sender == game.whitePlayer)
                opponent = game.blackPlayer;
            else if (sender == game.blackPlayer)
                opponent = game.whitePlayer;
            if (typeof opponent !== 'undefined') {
                var resp = {
                    action: 'message-received',
                    body: {
                        text: msg.text
                    }
                };
                opponent.sendUTF(JSON.stringify(resp));
            }
        }
    }
}

exports.sendMessage = sendMessage;