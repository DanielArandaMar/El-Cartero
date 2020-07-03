'use strict'

const express = require('express');
const api = express.Router();
const UserController = require('../controllers/user');

api.post('/user/register', UserController.register);


module.exports = api;