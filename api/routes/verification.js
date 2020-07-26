'use strict'

const express = require('express');
const api = express.Router();
const VerificationController = require('../controllers/verification');

const auth_md = require('../middlewares/authenticated');
const md_auth_active = require('../middlewares/activeAccount');


/* ELIMINAR DOCUMENTO DE VERIFICACION */
api.delete('/verification/delete/:accountId', [auth_md.auth, md_auth_active.verifyActiveAcc], VerificationController.deleteVerification);

module.exports = api;
