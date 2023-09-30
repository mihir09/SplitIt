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
    }]
});

module.exports = mongoose.model('User', userSchema);