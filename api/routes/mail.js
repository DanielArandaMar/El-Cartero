'use strict'

const express = require('express');
const multiparty = require('connect-multiparty');
const api = express.Router();
const MailController = require('../controllers/mail');

const auth_md = require('../middlewares/authenticated');
const md_auth_active = require('../middlewares/activeAccount');
const md_upload = multiparty({uploadDir: './uploads/image-mails'});


// ENVIAR UN CORREO
api.post('/mail/send', [auth_md.auth, md_auth_active.verifyActiveAcc], MailController.sendMail);

// ENVIAR IMAGEN ADJUNTA EN EL CORREO
api.post('/mail/upload-image/:id', [auth_md.auth, md_upload], MailController.uploadImage);

// OBTENER MIS MAILS PAGINADOS
api.get('/mail/my-mails-conversation/:page?', [auth_md.auth, md_auth_active.verifyActiveAcc], MailController.getMyMailsConversation);

// OBTENER UN CORREO EN CONCRETO
api.get('/mail/single/:id', [auth_md.auth, md_auth_active.verifyActiveAcc], MailController.getMail);

// OBTENER MIS CONVERSACIONES
api.get('/mail/conversations', [auth_md.auth, md_auth_active.verifyActiveAcc], MailController.getMyConversations);

// ELIMINAR UN CORREO QUE EL USUARIO IDENTIFICADO EMITIÓ
api.delete('/mail/delete/:id', [auth_md.auth, md_auth_active.verifyActiveAcc], MailController.deleteMyMail);

module.exports = api;
