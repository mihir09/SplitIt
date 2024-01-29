const mongoose = require('mongoose');

// User schema
const Schema = mongoose.Schema;
const userSchema = new Schema({
    username: String,
    email: { type: String, required: true, unique: true },
    password: String,
    groups: [{
        groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
        groupName: String
    }],
    invitations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Invitation' }]
});

module.exports = mongoose.model('User', userSchema);