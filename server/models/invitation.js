const mongoose = require('mongoose');

// Invitation schema
const Schema = mongoose.Schema;
const invitationSchema = Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    groupName: { type: String, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'groupId', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Invitation', invitationSchema);