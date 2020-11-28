
var express = require("express");
var app = express();
var bodyParser  = require("body-parser");
var session  = require("express-session");

var methodOverride = require("method-override");

var passport = require('passport');

var config = require('./config');

app.set('port', process.env.PORT || (config.express ? config.express.port : 2021));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(session({
    secret: 'idsmedia_tw_rooms',
    resave: false,
    saveUninitialized: true
    /* cookie: { secure: true } for HTTPS */
}));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,PATCH,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

app.use(passport.initialize());
app.use(passport.session());

var router = express.Router();

app.use(router);
app.use("/", express.static('./public'));

require('./components').initialize(app);

module.exports = app;




