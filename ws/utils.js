'use strict'

var removeFromWaiting = function (sender) {
    if (typeof sender.urWaitingGame !== 'undefined') {
        delete global.waitingRoom[sender.urWaitingGame];
        delete sender.urWaitingGame;
    }
}

var removeFromActive = function (sender) {
    if (typeof sender.urActiveGame !== 'undefined') {
        var key = sender.urActiveGame;
        var value = global.activeGames[key];
        var opponent;
        if (sender == value.whitePlayer)
            opponent = value.blackPlayer;
        else
            opponent = value.whitePlayer;

        removeAllSpectators(value);
        delete global.activeGames[key];
        delete sender.urActiveGame;
        delete opponent.urActiveGame;
        //remove game from spectating list too
        delete global.spectateGameList[key];
        opponent.sendUTF(JSON.stringify({ action: 'opponent-left' }));
    }
}

var removeSpectator = function (sender) {
    if (typeof sender.urSpectatingGame !== 'undefined') {
        var key = sender.urSpectatingGame;
        if (typeof global.activeGames[key] !== 'undefined') {
            var game = global.activeGames[key];
            game.spectators = game.spectators.filter(e => e !== sender);
        }
        delete sender.urSpectatingGame;
    }
}

var checkMove = function (cell, color, id) {
    cell = Number(cell);
    var game = global.activeGames[id];
    if (typeof game !== 'undefined') {
        var boardState = game.boardState;
        if (typeof boardState.dice !== 'undefined')
            //if valid color
            if (boardState.toMove === color || cell > 4 && cell < 13) {
                var actualColor = color;
                if (actualColor === 'neutral')
                    if (boardState.whitePieces[cell] > 0)
                        actualColor = 'white';
                    else
                        actualColor = 'black';
                var ours, theirs;
                if (actualColor === 'white') {
                    ours = boardState.whitePieces;
                    theirs = boardState.blackPieces;
                }
                else {
                    ours = boardState.blackPieces;
                    theirs = boardState.whitePieces;
                }
                //check if there is a piece on that position
                if (ours[cell] > 0) {
                    var endSquare = cell + Number(boardState.dice);
                    //not to go over & no friendly piece there unless it's square 15
                    if (endSquare == 15 || endSquare < 15 && ours[endSquare] == 0)
                        //not square 8 if enemy is there
                        if (endSquare != 8 || theirs[endSquare] == 0) {
                            return { endSquare: endSquare, color: actualColor };
                        }
                }
            }
    }
}

var getSortedSpectateList = function (gameList) {
    var spectateList = [];

    for (var gameID in gameList) {
        var started = gameList[gameID].started;
        var seconds = (Date.now() - started) / 1000 >> 0;
        var minutes = seconds / 60 >> 0;
        var hours = minutes / 60 >> 0;
        var days = hours / 24 >> 0;
        var text = '> ';
        if (days > 0)
            text += days + (days > 1 ? ' days' : ' day');
        else if (hours > 0)
            text += hours + (hours > 1 ? ' hours' : ' hour');
        else if (minutes > 0)
            text += minutes + (minutes > 1 ? ' minutes' : ' minute');
        else
            text += seconds + (seconds > 1 ? ' seconds' : ' second');
        spectateList.push({ id: gameID, started: started, text: text });
    }
    //sort descending by time started
    spectateList.sort(function (a, b) {
        if (a.started > b.started)
            return -1;
        else if (a.started < b.started)
            return 1;
        else
            return 0;
    });
    return spectateList;
}

exports.getSortedSpectateList = getSortedSpectateList;
exports.removeFromWaiting = removeFromWaiting;
exports.removeFromActive = removeFromActive;
exports.removeSpectator = removeSpectator;
exports.checkMove = checkMove;

var removeAllSpectators = function (game) {
    for (var spec in game.spectators)
        delete spec.urSpectatingGame;
    game.spectators = [];
}