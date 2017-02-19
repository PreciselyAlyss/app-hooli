var express = require('express');
var path = require('path');
var passport = require('passport');
var redis = require('redis');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;


var app = express();

require('dotenv').config()

dotenv.load();

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

// needed for dotenv setup
// var google_creds = require('google_creds')

//google oauth setup
passport.use(new GoogleStrategy({
        clientID: process.ENV.GOOGLE_CLIENT_ID,
        clientSecret: process.ENV.GOOGLE_CLIENT_SECRET,
        callbackURL: process.ENV.GOOGLE_CALLBACK_URL
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
