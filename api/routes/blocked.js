'use strict'

const express = require('express');
const api = express.Router();
const BlockedController = require('../controllers/blocked');

const md_auth = require('..//middlewares/authenticated');
const md_auth_active = require('../middlewares/activeAccount');

api.post('/blocked/add-user', [md_auth.auth, md_auth_active.verifyActiveAcc], BlockedController.save);
api.delete('/blocked/remove-user/:blocked', [md_auth.auth, md_auth_active.verifyActiveAcc], BlockedController.delete);


module.exports = api;
