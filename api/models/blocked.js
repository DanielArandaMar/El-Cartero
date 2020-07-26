'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const BlockedSchema = Schema({
    user: {type: Schema.ObjectId, ref: 'User'},
    user_blocked: {type: Schema.ObjectId, ref: 'User'},
    reason: String,
    created_at: String
});
module.exports = mongoose.model('Blocked', BlockedSchema);