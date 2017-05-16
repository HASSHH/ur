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

    var prev;
    for (var key in global.waitingRoom)
    {
        var value = global.waitingRoom[key];
        if (value == sender)
            prev = key;
    }
    var resp = {
        action: "wait-for-game",
        body: {}
    };
    if (prev == undefined) {
        var code = genCode();
        global.waitingRoom[code] = sender;
        resp.body.code = code.toString();
    }
    else {
        resp.body.code = prev;
    }
    sender.sendUTF(JSON.stringify(resp));
}

exports.newGame = newGame;