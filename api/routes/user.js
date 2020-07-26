'use strict'

const express = require('express');
const api = express.Router();
const multipart = require('connect-multiparty');
const UserController = require('../controllers/user');

const auth_md = require('../middlewares/authenticated');
const md_auth_email = require('../middlewares/emailUserEdit');
const md_auth_active = require('../middlewares/activeAccount');
const multipart_md = multipart({ uploadDir: './uploads/image-users' });

// RUTA DE REGISTRO
api.post('/user/register', UserController.register);

// RUTA DE AUTENTICACIÓN
api.post('/user/login', UserController.login);

// actualizar infromación básica del usuario
api.put('/user/update-general-data', [auth_md.auth, md_auth_active.verifyActiveAcc], UserController.updateUserGeneralData);

// ACTUALIZAR NOMBRE DE USUARIO
api.put('/user/update-nickname', [auth_md.auth, md_auth_active.verifyActiveAcc], UserController.updateUserNickname);

// ACTUALIZAR LA CONTRASEÑA DEL USUARIO
api.put('/user/update-password', [auth_md.auth, md_auth_active.verifyActiveAcc], UserController.updateUserPassword);

// ACTUALIZAR CORREO ELECTRÓNICO DEL USUARIO
api.put('/user/update-email', [auth_md.auth, md_auth_active.verifyActiveAcc], UserController.updateEmail);

// CAMBIAR EL CORREO ELECTRÓNICO DEL REGISTRO
api.put('/user/change-my-email/:code', [auth_md.auth, md_auth_active.verifyActiveAcc, md_auth_email.verify], UserController.changeEmailUser);

// SUBIR FOTO DE PERFIL DEL USUARIO
api.post('/user/upload-image', [auth_md.auth, md_auth_active.verifyActiveAcc, multipart_md], UserController.uploadImage);

// OBTENER FOTO DE PERFIL DEL USUARIO
api.get('/user/get-image/:imageFile', UserController.getUserImage);


module.exports = api;
