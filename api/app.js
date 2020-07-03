'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

let user_routes = require('./routes/user');
let account_routes = require('./routes/account');
let verification_routes = require('./routes/verification');
let mail_routes = require('./routes/mail');
let blocked_routes = require('./routes/blocked');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

app.use('/api', user_routes);
app.use('/api', account_routes);
app.use('/api', verification_routes);
app.use('/api', mail_routes);
app.use('/api', blocked_routes);

module.exports = app;