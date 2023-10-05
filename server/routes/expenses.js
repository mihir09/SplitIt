const express = require('express');
const router = express.Router();
const Expense = require('../models/expense');
const Group = require('../models/group');
const User = require('../models/user');

// Create a new expense
router.post('/', async (req, res) => {
  try {
    const { expenseName, payer, expenseDate, description, amount, groupId, payerName } = req.body;
    var group;
    if (groupId) {
      group = await Group.findById(groupId);
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
      // Calculate Split
      const payerUser = await User.findOne({ _id: payer });
      if(!payerUser){
        return res.status(404).json({ message: 'Payer not found' });
      }
  
      const members = group.members;

      const totalAmount = parseFloat(amount.toFixed(2));
      const rawSplitAmount = totalAmount / members.length;
      const splitAmount = parseFloat(rawSplitAmount.toFixed(2));

      for (const member of members) {
        if (member.memberId == payer){
          member.memberBalance += totalAmount;
        }
        member.memberBalance -= splitAmount;
      }
      console.log(members)

      // settleBalance
      // Yet to work

      await group.save();
    }


    return res.status(201).json(expense);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;
