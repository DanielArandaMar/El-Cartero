'use strict'

const express = require('express');
const api = express.Router();
const AccountController = require('../controllers/account.js');

const md_auth = require('../middlewares/authenticated');

// CAMBIAR DE UNA CUENTA INACTIVA A UNA CUENTA ACTIVA
api.post('/account/change-to-active/:code', md_auth.auth, AccountController.changeToActive);

module.exports = api;
