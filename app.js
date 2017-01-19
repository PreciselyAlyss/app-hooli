var express = require('express');
var path = require('path');
var algoliasearch = require('algoliasearch');

var app = express();

var client = algoliasearch('FP9WZYG9KK', '6f8534882bd2383dc21b40b1458091df');
var index = client.initIndex('app_BC');

app.use(express.static('public'));


app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/views/index.html'));
});

module.exports = app;
