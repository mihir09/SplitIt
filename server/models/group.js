const mongoose = require('mongoose');

// Group schema
const Schema = mongoose.Schema;
const groupSchema = new Schema({
    name: { type: String, required: true, unique: true },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    expenses: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Expense',
        },
    ],
});

module.exports = mongoose.model('Group', groupSchema);