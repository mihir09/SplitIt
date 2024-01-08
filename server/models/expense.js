const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  expenseName: {
    type: String,
    required: true,
  },
  payer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  expenseDate: {
    type: Date,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  groupId: {
    type: String,
    required: false,
  },
  payerName: String,
  participants: {
    type: Map,
    of: Number,
  },
  splitType: String,
  category: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model('Expense', expenseSchema);
