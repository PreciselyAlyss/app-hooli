var express = require('express');
var path = require('path');
var algoliasearch = require('algoliasearch');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var index = require('./routes/index');
var login = require('./routes/login');

var app = express();

app.use(passport.initialize());
app.use(passport.session());

app.set('views', path.join(__dirname, 'views'));

//google oauth setup
passport.use(new GoogleStrategy({
        clientID: '432515055149-b0sltc313cuuopa3gkd8lmpm0lmqqo5i.apps.googleusercontent.com',
        clientSecret: '2VHbXpFwqaw0Y-5b9NOeNiLE',
        callbackURL: "http://localhost:3000/auth/google/callback"
    },
    function(token, tokenSecret, profile, done) {

        if (profile._json.domain !== 'bigcommerce.com') {
            done(new Error("Not a Bigcommerce account"));
        } else {
            done(null, profile);
        }
    }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

app.get('/auth/google',
    passport.authenticate('google', { scope: ["profile", "email"] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', successRedirect: '/index'}));

app.use(express.static('public'));

app.get('/index', function (req, res) {
	res.sendFile(path.join(__dirname + '/views/index.html'));
});

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/views/login.html'));
});

module.exports = app;
