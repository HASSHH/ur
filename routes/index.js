﻿'use strict';
var express = require('express');
var router = express.Router();
var utils = require('../ws/utils')

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', { title: 'The Royal Game of Ur' });
});

/* GET play page. */
router.get('/play', function (req, res) {
    res.render('play');
});

/* GET spectate page. */
router.get('/spectate', function (req, res) {
    var spectateList = utils.getSortedSpectateList(global.spectateGameList);
    res.render('spectate', { games: spectateList });
});

router.get('/spectate/:id', function (req, res) {
    res.render('spectate-game', { id: req.params.id });
});

/* called when a spec list refresh is needed; returns only the list*/
router.get('/spectate-list', function (req, res) {
    var spectateList = utils.getSortedSpectateList(global.spectateGameList);
    res.send(spectateList);
});

module.exports = router;
