'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConversationSchema = Schema({
    first_member: {type: Schema.ObjectId, ref: 'User'},
    second_member: {type: Schema.ObjectId, ref: 'User'},
    created_at: String
});
module.exports = mongoose.model('Conversation', ConversationSchema);