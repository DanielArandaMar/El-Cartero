'use strict'

const express = require('express');
const api = express.Router();
const UserController = require('../controllers/user');
const auth_md = require('../middlewares/authenticated');

// RUTA DE REGISTRO
api.post('/user/register', UserController.register);

// RUTA DE AUTENTICACIÓN
api.post('/user/login', UserController.login);

// actualizar infromación básica del usuario
api.put('/user/update-general-data', auth_md.auth, UserController.updateUserGeneralData);

// ACTUALIZAR NOMBRE DE USUARIO
api.put('/user/update-nickname', auth_md.auth, UserController.updateUserNickname);

// ACTUALIZAR LA CONTRASEÑA DEL USUARIO
api.put('/user/update-password', auth_md.auth, UserController.updateUserPassword);

// ACTUALIZAR CORREO ELECTRÓNICO DEL USUARIO
api.put('/user/update-email', auth_md.auth, UserController.updateEmail);

module.exports = api;