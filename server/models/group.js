const mongoose = require('mongoose');

// Group schema
const Schema = mongoose.Schema;
const groupSchema = new Schema({
    name: { type: String, required: true, unique: true },
    members: [
        {
            memberId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
            memberBalance: Number
        }
    ],
    expenses: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Expense',
        },
    ],
    balance: [
        {
            from: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
            to: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
            balance: Number
        }
    ]
});

module.exports = mongoose.model('Group', groupSchema);