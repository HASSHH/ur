'use strict';
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', { title: 'The Royal Game of Ur' });
});

/* GET play page. */
router.get('/play', function (req, res) {
    res.render('play');
});

module.exports = router;
