'use strict'

const express = require('express');
const api = express.Router();
const multipart = require('connect-multiparty');
const UserController = require('../controllers/user');
const auth_md = require('../middlewares/authenticated');
const multipart_md = multipart({ uploadDir: './uploads/image-users' });

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

// SUBIR FOTO DE PERFIL DEL USUARIO
api.post('/user/upload-image', [auth_md.auth, multipart_md], UserController.uploadImage);

// OBTENER FOTO DE PERFIL DEL USUARIO
api.get('/user/get-image/:imageFile', UserController.getUserImage);

module.exports = api;