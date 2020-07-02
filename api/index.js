'use strict'

const mongoose = require('mongoose');
const app = require('./app');
const port = process.env.PORT || 3000;

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/elcartero')
    .then(() => {
        console.log('- - - - Database connected - - - -');
        app.listen(port, () => {
            console.log('- - - - Server running at port ' + port + '- - - -');
        });
    })
    .catch(err => {
        console.log(err);
    });