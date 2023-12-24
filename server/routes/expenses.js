const express = require('express');
const router = express.Router();
const Expense = require('../models/expense');
const Group = require('../models/group');
const User = require('../models/user');

// Create a new expense
router.post('/', async (req, res) => {
  try {
    const { expenseName, payer, expenseDate, description, amount, groupId, payerName, participants } = req.body;
    // console.log(participants)
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
      amount: totalAmount,
      groupId,
      payerName,
      participants
    });

    await expense.save();
    // console.log(expense)

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
      // console.log("Before", members)
      const [groupBalance, debtors, creditors] = settleDebts(membersDetails);


      // console.log(groupBalance, debtors, creditors);


      while (debtors.length > 0) {
        debtor = debtors[0]
        debtorMember = group.members.find(member => member._id == debtor._id);
        debtorMember.memberBalance += debtor.memberBalance
        debtorMember.memberBalance = Number(debtorMember.memberBalance.toFixed(2));
        // console.log("updated balance ",debtorMember.memberBalance)
        debtors.shift();
      }

      while (creditors.length > 0) {
        creditor = creditors[0]
        creditorMember = group.members.find(member => member._id == creditor._id);
        creditorMember.memberBalance -= creditor.memberBalance
        creditorMember.memberBalance = Number(creditorMember.memberBalance.toFixed(2));

        // console.log("updated balance ",creditorMember.memberBalance)
        creditors.shift();
      }

      group.balance = [];
      // console.log(members)
      groupBalance.forEach(balance => {
        group.balance.push(balance);
      });
      // console.log(group.balance)
      await group.save();
    }


    return res.status(201).json(expense);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Deleting expense
router.delete('/:expenseId', async (req, res) => {
  try {
    const expenseId = req.params.expenseId;

    const expense = await Expense.findById(expenseId);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (!expense.groupId) {
      return res.status(404).json({ message: 'Expense group not found' });
    }
    const group = await Group.findById(expense.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Expense group not found' });
    }
    const payerUser = await User.findOne({ _id: expense.payer });
    if (!payerUser) {
      return res.status(404).json({ message: "Expense payer couldn't be linked" });
    }
    members = group.members;
    const rawSplitAmount = expense.amount / members.length;
    const splitAmount = parseFloat(rawSplitAmount.toFixed(2));
    // console.log('Split Amount', splitAmount)
    // var remainder = parseFloat(totalAmount - (splitAmount * members.length)).toFixed(2);


    for (const member of members) {
      // console.log(expense.payer)
      if (member.memberId.toString() === expense.payer.toString()) {
        // console.log('Payer', member.memberBalance)
        const unroundedResult = member.memberBalance - expense.amount;
        const roundedResult = parseFloat(unroundedResult.toFixed(2));
        member.memberBalance = roundedResult;
        // console.log('Payer', member.memberBalance)
      }
      // console.log('Rest', member.memberBalance)
      const unroundedResult = member.memberBalance + splitAmount;
      var roundedResult = parseFloat(unroundedResult.toFixed(2));


      // if (remainder<=0 && member.memberBalance<=0){
      //   roundedResult = parseFloat((roundedResult - 0.01).toFixed(2))
      //   remainder += 0.01

      // }
      member.memberBalance = roundedResult;
      // console.log('Rest', member.memberBalance)
    }


    await group.save();
    // console.log(group)
    // settleBalance
    membersDetails = JSON.parse(JSON.stringify(group.members));
    // console.log("Before", members)
    const [groupBalance, debtors, creditors] = settleDebts(membersDetails);


    // console.log(groupBalance, debtors, creditors);


    while (debtors.length > 0) {
      debtor = debtors[0]
      debtorMember = group.members.find(member => member._id == debtor._id);
      debtorMember.memberBalance -= debtor.memberBalance
      debtorMember.memberBalance = Number(debtorMember.memberBalance.toFixed(2));
      // console.log("updated balance ",debtorMember.memberBalance)
      debtors.shift();
    }

    while (creditors.length > 0) {
      creditor = creditors[0]
      creditorMember = group.members.find(member => member._id == creditor._id);
      creditorMember.memberBalance += creditor.memberBalance
      creditorMember.memberBalance = Number(creditorMember.memberBalance.toFixed(2));

      // console.log("updated balance ",creditorMember.memberBalance)
      creditors.shift();
    }

    group.balance = [];
    // console.log(members)
    groupBalance.forEach(balance => {
      group.balance.push(balance);
    });
    // console.log(group.balance)
    await group.save();


    group.expenses = group.expenses.filter(expense => expense.toString() !== expenseId);

    await group.save();


    return res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  const expenseId = req.params.id;
  try {
    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      { $set: req.body.expenseData },
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (!updatedExpense.groupId) {
      return res.status(404).json({ message: 'Expense group not found' });
    }
    
    const group = await Group.findById(updatedExpense.groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Expense group not found' });
    }

    const oldExpense = req.body.oldExpenseData;
    // console.log(oldExpense)
    const payerUser = await User.findOne({ _id: oldExpense.payer });
    if (!payerUser) {
      return res.status(404).json({ message: "Expense payer couldn't be linked" });
    }
    members = group.members;
    const rawSplitAmount = oldExpense.amount / members.length;
    const splitAmount = parseFloat(rawSplitAmount.toFixed(2));
    // console.log('Split Amount', splitAmount)
    // var remainder = parseFloat(totalAmount - (splitAmount * members.length)).toFixed(2);


    for (const member of members) {
      // console.log(expense.payer)
      if (member.memberId.toString() === oldExpense.payer.toString()) {
        // console.log('Payer', member.memberBalance)
        const unroundedResult = member.memberBalance - oldExpense.amount;
        const roundedResult = parseFloat(unroundedResult.toFixed(2));
        member.memberBalance = roundedResult;
        // console.log('Payer', member.memberBalance)
      }
      // console.log('Rest', member.memberBalance)
      const unroundedResult = member.memberBalance + splitAmount;
      var roundedResult = parseFloat(unroundedResult.toFixed(2));


      // if (remainder<=0 && member.memberBalance<=0){
      //   roundedResult = parseFloat((roundedResult - 0.01).toFixed(2))
      //   remainder += 0.01

      // }
      member.memberBalance = roundedResult;
      // console.log('Rest', member.memberBalance)
    }


    await group.save();
    // console.log(group)
    // settleBalance
    membersDetails = JSON.parse(JSON.stringify(group.members));
    // console.log("Before", members)
    const [groupBalance, debtors, creditors] = settleDebts(membersDetails);


    // console.log(groupBalance, debtors, creditors);


    while (debtors.length > 0) {
      debtor = debtors[0]
      debtorMember = group.members.find(member => member._id == debtor._id);
      debtorMember.memberBalance -= debtor.memberBalance
      debtorMember.memberBalance = Number(debtorMember.memberBalance.toFixed(2));
      // console.log("updated balance ",debtorMember.memberBalance)
      debtors.shift();
    }

    while (creditors.length > 0) {
      creditor = creditors[0]
      creditorMember = group.members.find(member => member._id == creditor._id);
      creditorMember.memberBalance += creditor.memberBalance
      creditorMember.memberBalance = Number(creditorMember.memberBalance.toFixed(2));

      // console.log("updated balance ",creditorMember.memberBalance)
      creditors.shift();
    }

    group.balance = [];
    // console.log(members)
    groupBalance.forEach(balance => {
      group.balance.push(balance);
    });
    // console.log(group.balance)

    await group.save();

    // Add expense

    // console.log("Now add new expense")

    const newExpense = req.body.expenseData;

    const payer = await User.findOne({ _id: newExpense.payer });
    if (!payer) {
      return res.status(404).json({ message: "Expense payer couldn't be linked" });
    }

    const totalAmount = parseFloat(newExpense.amount.toFixed(2));
    members = group.members;
    const rawSplitAmountNew = newExpense.amount / members.length;
    const splitAmountNew = parseFloat(rawSplitAmountNew.toFixed(2));

    for (const member of members) {
      if (member.memberId.toString() === newExpense.payer.toString()) {
        const unroundedResult = member.memberBalance + totalAmount;
        const roundedResult = parseFloat(unroundedResult.toFixed(2));
        member.memberBalance = roundedResult;
      }
      const unroundedResult = member.memberBalance - splitAmountNew;
      var roundedResult = parseFloat(unroundedResult.toFixed(2));

      // if (remainder<=0 && member.memberBalance<=0){
      //   roundedResult = parseFloat((roundedResult - 0.01).toFixed(2))
      //   remainder += 0.01

      // }
      member.memberBalance = roundedResult;
    }


    await group.save();
    // console.log("Update Member balance", members)
    // settleBalance
    membersDetails = JSON.parse(JSON.stringify(group.members));
    // console.log("Before", members)
    const [groupBalanceNew, debtorsNew, creditorsNew] = settleDebts(membersDetails);


    // console.log(groupBalance, debtors, creditors);


    while (debtorsNew.length > 0) {
      debtor = debtorsNew[0]
      debtorMember = group.members.find(member => member._id == debtor._id);
      debtorMember.memberBalance += debtor.memberBalance
      debtorMember.memberBalance = Number(debtorMember.memberBalance.toFixed(2));
      // console.log("updated balance ",debtorMember.memberBalance)
      debtorsNew.shift();
    }

    while (creditorsNew.length > 0) {
      creditor = creditorsNew[0]
      creditorMember = group.members.find(member => member._id == creditor._id);
      creditorMember.memberBalance -= creditor.memberBalance
      creditorMember.memberBalance = Number(creditorMember.memberBalance.toFixed(2));

      // console.log("updated balance ",creditorMember.memberBalance)
      creditorsNew.shift();
    }

    group.balance = [];
    // console.log(members)
    groupBalanceNew.forEach(balance => {
      group.balance.push(balance);
    });
    // console.log(group.balance)
    await group.save();

    const index = group.expenses.findIndex(e => e.equals(updatedExpense._id));
    group.expenses[index] = updatedExpense;
    await group.save();

    return res.status(200).json(updatedExpense);
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

    debtor.memberBalance = parseFloat((debtor.memberBalance + absoluteBalance).toFixed(2));
    creditor.memberBalance = parseFloat((creditor.memberBalance - absoluteBalance).toFixed(2));

    if (debtor.memberBalance === 0) debtors.shift();
    if (creditor.memberBalance === 0) creditors.shift();
  }

  return [remainingBalance, debtors, creditors];
}

module.exports = router;
