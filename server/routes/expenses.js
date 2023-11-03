const express = require('express');
const router = express.Router();
const Expense = require('../models/expense');
const Group = require('../models/group');
const User = require('../models/user');
const Balance = require('../models/balance');
const balance = require('../models/balance');

// Create a new expense
router.post('/', async (req, res) => {
  try {
    const { expenseName, payer, expenseDate, description, amount, groupId, payerName } = req.body;
    var group;
    if (groupId) {
      group = await Group.findById(groupId);
    }
    
    const totalAmount = parseFloat(amount.toFixed(2));

    const expense = new Expense({
      expenseName,
      payer,
      expenseDate,
      description,
      amount:totalAmount,
      groupId,
      payerName
    });

    await expense.save();

    if (group) {
      group.expenses.push(expense._id)
      // Calculate Split
      const payerUser = await User.findOne({ _id: payer });
      if (!payerUser) {
        return res.status(404).json({ message: 'Payer not found' });
      }

      members = group.members;
      const rawSplitAmount = totalAmount / members.length;
      const splitAmount = parseFloat(rawSplitAmount.toFixed(2));
      var remainder = parseFloat(totalAmount - (splitAmount * members.length)).toFixed(2);


      for (const member of members) {
        if (member.memberId == payer) {
          const unroundedResult = member.memberBalance + totalAmount;
          const roundedResult = parseFloat(unroundedResult.toFixed(2));
          member.memberBalance = roundedResult;
        }
        const unroundedResult = member.memberBalance - splitAmount;
        var roundedResult = parseFloat(unroundedResult.toFixed(2));

        // if (remainder<=0 && member.memberBalance<=0){
        //   roundedResult = parseFloat((roundedResult - 0.01).toFixed(2))
        //   remainder += 0.01

        // }
        member.memberBalance = roundedResult;
      }

      
      await group.save();
      // settleBalance
      membersDetails = JSON.parse(JSON.stringify(group.members));

      const [groupBalance, debtors, creditors] = settleDebts(membersDetails);


      console.log(groupBalance);


      while (debtors.length > 0){
        debtor = debtors[0]
        debtorMember = group.members.find(member => member._id == debtor._id);
        debtorMember.memberBalance+=debtor.memberBalance
        console.log("updated balance ",debtorMember.memberBalance)
        debtors.shift();
      }

      while (creditors.length > 0){
        creditor = creditors[0]
        creditorMember = group.members.find(member => member._id == creditor._id);
        creditorMember.memberBalance-=creditor.memberBalance
        creditorMember.memberBalance = Number(creditorMember.memberBalance.toFixed(2));

        console.log("updated balance ",creditorMember.memberBalance)
        creditors.shift();
      }

      group.balance = [];
      
      groupBalance.forEach(balance => {
        group.balance.push(balance);
      });
      console.log(group.balance)
      await group.save();
    }


    return res.status(201).json(expense);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

function settleDebts(members) {
  const debtors = members.filter(member => member.memberBalance < 0).sort((a, b) => a.memberBalance - b.memberBalance);
  const creditors = members.filter(member => member.memberBalance > 0).sort((a, b) => b.memberBalance - a.memberBalance);

  const remainingBalance = [];

  while (debtors.length > 0 && creditors.length > 0) {
    const debtor = debtors[0];
    const creditor = creditors[0];
    const balance = Math.min(Math.abs(debtor.memberBalance), creditor.memberBalance);
    const absoluteBalance = parseFloat(balance.toFixed(2))
    remainingBalance.push({ from: debtor.memberId, to: creditor.memberId, balance: absoluteBalance });

    debtor.memberBalance = parseFloat((debtor.memberBalance+absoluteBalance).toFixed(2));
    creditor.memberBalance = parseFloat((creditor.memberBalance-absoluteBalance).toFixed(2));

    if (debtor.memberBalance === 0) debtors.shift();
    if (creditor.memberBalance === 0) creditors.shift();
  }

  return [remainingBalance, debtors, creditors];
}

module.exports = router;
