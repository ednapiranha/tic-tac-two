var express = require('express');
var configurations = module.exports;
var app = express.createServer();
var nconf = require('nconf');
var redis = require('redis');
var db = redis.createClient();
var settings = require('./settings')(app, configurations, express);

nconf.argv().env().file({ file: 'local.json' });

// routes
require("./routes")(app, db);

app.listen(process.env.PORT || nconf.get('port'));
