'use strict'

var utils = require('../utils');

var index = 1;

var genCode = function () {
    //TO DO not incremented code
    return index++;
}

var newGame = function (sender, msg) {
    //if the caller is in an active game remove that entry and notify the opponent
    utils.removeFromActive(sender);
    
    var resp = {
        action: "wait-for-game",
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