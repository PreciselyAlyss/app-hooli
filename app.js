var express = require('express');
var path = require('path');
var passport = require('passport');
var redis = require('redis');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

var client1 = redis.createClient(16666, 'redis-16666.c9.us-east-1-4.ec2.cloud.redislabs.com', {no_ready_check: true});
client1.auth('butts123', function (err) {
    if (err) throw err;
});

client1.on('connect', function() {
    console.log('Connected to Redis');
});

app.use(session({
    store: new RedisStore({
    client: client1
    }),
    secret: 'milhouse',
    resave: false,
    saveUninitialized: false,
    name: 'app-search-cookie',
    ttl:9900
}));

app.use(passport.initialize());
app.use(passport.session());

//google oauth setup
passport.use(new GoogleStrategy({
        clientID: '432515055149-b0sltc313cuuopa3gkd8lmpm0lmqqo5i.apps.googleusercontent.com',
        clientSecret: '2VHbXpFwqaw0Y-5b9NOeNiLE',
        callbackURL: "http://localhost:3000/auth/google/callback"
    },
    function(accessToken, refreshToken, profile, done) {

        if (profile._json.domain !== 'bigcommerce.com') {
            done(new Error("Not a Bigcommerce account"));
        } else {
            console.log(profile._json.displayName);
            done(null, profile);
        }
    }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect(302, '/login');
}

app.get('/auth/google',
    passport.authenticate('google', { scope: ["profile", "email"] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', successRedirect: '/'}));

app.get('/login', function (req, res) {
    console.log(req.session.id);
	res.sendFile(path.join(__dirname + '/views/login.html'));
});

app.get('/',
    ensureAuthenticated,
    function (req, res) {
    res.sendFile(path.join(__dirname + '/views/index.html'));
});

module.exports = app;
