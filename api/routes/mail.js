'use strict'

const express = require('express');
const multiparty = require('connect-multiparty');
const api = express.Router();
const md_auth = require('../middlewares/authenticated');
const md_upload = multiparty({uploadDir: './uploads/image-mails'});
const MailController = require('../controllers/mail');

// ENVIAR UN CORREO
api.post('/mail/send', md_auth.auth, MailController.sendMail);

// ENVIAR IMAGEN ADJUNTA EN EL correo
api.post('/mail/upload-image/:id', [md_auth.auth, md_upload], MailController.uploadImage);

// OBTENER MIS MAILS PAGINADOS
api.get('/mail/my-mails/:page?', md_auth.auth, MailController.getMyMails);

// OBTENER UN CORREO EN CONCRETO
api.get('/mail/single/:id', md_auth.auth, MailController.getMail);

module.exports = api;
