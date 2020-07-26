'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const VerificationSchema = Schema({
    account: {type: Schema.ObjectId, ref: 'Account'},
    code: String,
    new_email: String,
    created_at: String
});
module.exports = mongoose.model('Verification', VerificationSchema);
