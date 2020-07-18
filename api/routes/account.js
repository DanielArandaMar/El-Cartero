'use strict'

const express = require('express');
const api = express.Router();
const md_auth = require('../middlewares/authenticated');
const AccountController = require('../controllers/account.js');

// CAMBIAR DE UNA CUENTA INACTIVA A UNA CUENTA ACTIVA
api.post('/account/change-to-active', md_auth.auth, AccountController.changeToActive);

module.exports = api;