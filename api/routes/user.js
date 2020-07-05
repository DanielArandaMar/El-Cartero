'use strict'

const express = require('express');
const api = express.Router();
const UserController = require('../controllers/user');

// RUTA DE REGISTRO
api.post('/user/register', UserController.register);

// RUTA DE AUTENTICACIÓN
api.post('/user/login', UserController.login);

module.exports = api;