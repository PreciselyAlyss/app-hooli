var express = require('express');
var path = require('path');
var algoliasearch = require('algoliasearch');
var basicAuth = require('express-basic-auth');


var app = express();

app.use(basicAuth({
    users: {'Bigcommerce': 'Sellmore!'},
    challenge: true
}));

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/views/index.html'));
});

module.exports = app;
