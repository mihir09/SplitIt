const express = require('express');
const router = express.Router();
const Expense = require('../models/expense');
const Group = require('../models/group');

// Create a new expense
router.post('/', async (req, res) => {
  try {
    const { expenseName, payer, expenseDate, description, amount, groupId, payerName } = req.body;
    var group;
    if (groupId) {
      group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
    }
    const expense = new Expense({
      expenseName,
      payer,
      expenseDate,
      description,
      amount,
      groupId,
      payerName
    });

    await expense.save();

    if (group) {
      group.expenses.push(expense._id)
      await group.save();
    }

    return res.status(201).json(expense);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
