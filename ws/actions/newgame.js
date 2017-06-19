'use strict'

var utils = require('../utils');

var codeLength = 6;
var possibleCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

var genCode = function () {
    var charCount = possibleCharacters.length;
    var code;
    do {
        code = '';
        for (var i = 0; i < codeLength; ++i)
            code += possibleCharacters.charAt(Math.floor(Math.random() * charCount));
        //while code is duplicate
    } while (typeof global.waitingRoom[code] !== 'undefined' || typeof global.activeGames[code] !== 'undefined');
    return code;
}

var newGame = function (sender, msg) {
    //if the caller is in an active game remove that entry and notify the opponent
    utils.removeFromActive(sender);
    
    var resp = {
        action: 'wait-for-game',
        body: {}
    };
    if (typeof sender.urWaitingGame !== 'undefined') {
        resp.body.code = sender.urWaitingGame.toString();
    }
    else {
        var code = genCode();
        global.waitingRoom[code] = sender;
        sender.urWaitingGame = code;
        resp.body.code = code.toString();
    }
    sender.sendUTF(JSON.stringify(resp));
}

exports.newGame = newGame;