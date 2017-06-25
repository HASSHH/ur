'use strict'

var utils = require('../utils');

var genDice = function () {
    var dice = 0;
    for (var i = 0; i < 4; ++i)
        dice += Math.floor((Math.random() * 2));
    return dice;
}

var hasPossibleMoves = function (id) {
    var game = global.activeGames[id];
    if (typeof game !== 'undefined') {
        var bs = game.boardState;
        var ours = bs.toMove === 'white' ? bs.whitePieces : bs.blackPieces;
        for (var i = 0; i < 15; ++i)
            if (ours[i] > 0 && utils.checkMove(i, bs.toMove, id))
                return true;
    }
    return false;
}

var rollDice = function (sender, msg) {
    if (typeof msg.id !== 'undefined' && msg.id !== null) {
        var game = global.activeGames[msg.id];
        if (typeof game !== 'undefined' && game.boardState != null) {
            var bs = game.boardState;
            var opponent;
            if (bs.toMove === 'white' && game.whitePlayer == sender)
                opponent = game.blackPlayer;
            else if (bs.toMove === 'black' && game.blackPlayer == sender)
                opponent = game.whitePlayer;
            else
                return;
            //check if a dice roll already happened this turn
            if (typeof bs.dice !== 'undefined') {
                //if true respond only to the sender with the value of the dice
                var resp = {
                    action: 'update-dice-roll',
                    body: {
                        dice: bs.dice,
                        endTurn: false
                    }
                };
                sender.sendUTF(JSON.stringify(resp));
            }
            else {
                //if false generate a dice roll and send the new value to both players
                bs.dice = genDice();
                var resp = {
                    action: 'update-dice-roll',
                    body: {
                        dice: bs.dice,
                        endTurn: false
                    }
                };
                if (bs.dice == 0 || !hasPossibleMoves(msg.id)) {
                    resp.body.endTurn = true;
                    bs.toMove = bs.toMove === 'white' ? 'black' : 'white';
                    delete bs.dice;
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

exports.rollDice = rollDice;