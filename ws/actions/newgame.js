'use strict'

var index = 1;

var genCode = function () {
    return index++;
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

var newGame = function (sender, msg) {
    //if the caller is in an active game remove that entry and notify the opponent
    removeFromActive(sender);

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