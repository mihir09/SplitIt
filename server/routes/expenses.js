const express = require('express');
const router = express.Router();
const Expense = require('../models/expense');
const Group = require('../models/group');
const User = require('../models/user');

// Find group by ID
async function findGroupById(groupId) {
  const group = await Group.findById(groupId);
  return group;
}

// Find user by ID
async function findUserById(userId) {
  const user = await User.findOne({ _id: userId });
  return user;
}

// Find expense by ID
async function findExpenseById(expenseId) {
  const expense = await Expense.findById(expenseId);
  return expense;
}

// Create and save expense
async function createExpense(expenseData) {
  const expense = new Expense(expenseData);
  await expense.save();
  return expense;
}

// Calculate and update participant amounts
async function calculateAndUpdateBalances(group, expense, operation) {
  const payer = group.members.find(member => member.memberId.toString() == expense.payer.toString());
  const participantsList = expense.participants instanceof Map
    ? expense.participants
    : new Map(Object.entries(expense.participants));
  // const rawSplitAmount = expense.amount / participantsList.size;
  // const splitAmount = parseFloat(rawSplitAmount.toFixed(2));

  // // Update participant amounts by adding the split amount
  // for (const [participantId, participantAmount] of participantsList.entries()) {
  //   participantsList.set(participantId, splitAmount);
  // }

  // Update participants balance
  for (const [participantId, participantAmount] of participantsList.entries()) {
    const member = group.members.find(member => member.memberId == participantId);

    if (!member) {
      throw new Error("Participant " + participantId + " missing in the group");
    }

    const unroundedResult = operation === 'add' ? member.memberBalance - participantAmount : member.memberBalance + participantAmount;
    const roundedResult = parseFloat(unroundedResult.toFixed(2));
    member.memberBalance = roundedResult;
  }

  // Update Payer balance
  const unroundedResult = operation === 'add' ? payer.memberBalance + expense.amount : payer.memberBalance - expense.amount;
  const roundedResult = parseFloat(unroundedResult.toFixed(2));
  payer.memberBalance = roundedResult;
  expense.participants = participantsList
  await expense.save()
  return group;
}

// Settle debts within the group
function settleGroupDebts(group, operation) {
  const membersDetails = JSON.parse(JSON.stringify(group.members));
  const [groupBalance, debtors, creditors] = settleDebts(membersDetails);

  while (debtors.length > 0) {
    let debtor = debtors[0];
    let debtorMember = group.members.find(member => member._id == debtor._id);
    debtorMember.memberBalance = operation === 'add' ? debtorMember.memberBalance + debtor.memberBalance : debtorMember.memberBalance - debtor.memberBalance;
    debtorMember.memberBalance = Number(debtorMember.memberBalance.toFixed(2));
    debtors.shift();
  }

  while (creditors.length > 0) {
    let creditor = creditors[0];
    let creditorMember = group.members.find(member => member._id == creditor._id);
    creditorMember.memberBalance = operation === 'add' ? creditorMember.memberBalance - creditor.memberBalance : creditorMember.memberBalance + creditor.memberBalance;
    creditorMember.memberBalance = Number(creditorMember.memberBalance.toFixed(2));
    creditors.shift();
  }

  group.balance = groupBalance.map(balance => ({ ...balance }));
  return group;
}

// Settle debts logic
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

// Create a new expense
async function handleExpenseCreation(req, res) {
  try {
    const { expenseName, payer, expenseDate, description, amount, groupId, payerName, participants, splitType, category } = req.body;

    // Find Group
    const group = await findGroupById(groupId);
    if (!groupId || !group) {
      return res.status(404).json({ message: "Group couldn't be linked" });
    }

    // Find Payer
    const payerUser = await findUserById(payer);
    if (!payer || !payerUser) {
      return res.status(404).json({ message: 'Payer not found' });
    }

    // Create and Save Expense
    const expenseData = {
      expenseName,
      payer,
      expenseDate,
      description,
      amount,
      groupId,
      payerName,
      participants,
      splitType,
      category
    };

    const expense = await createExpense(expenseData);

    // Link Expense to Group
    group.expenses.push(expense._id);

    operation = 'add';

    // Calculate and update balances
    calculateAndUpdateBalances(group, expense, operation);

    // Settle group debts
    settleGroupDebts(group, operation);
    // console.log(expense)

    await group.save();

    return res.status(201).json(expense);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
router.post('/', handleExpenseCreation);

// Delete Expense
async function handleExpenseDeletion(req, res) {
  try {
    const expenseId = req.params.expenseId;

    // Find Expense
    const expense = await findExpenseById(expenseId);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Find Group
    const group = await findGroupById(expense.groupId);
    if (!expense.groupId || !group) {
      return res.status(404).json({ message: "Expense Group couldn't be linked" });
    }

    // Group has expense or not
    const groupIncludesExpense = group.expenses.includes(expenseId);
    if (!groupIncludesExpense) {
      return res.status(404).json({ message: "Expense not found in group" });
    }

    // Find Payer
    const payerUser = await findUserById(expense.payer);
    if (!expense.payer || !payerUser) {
      return res.status(404).json({ message: 'Expense Payer not found' });
    }

    const operation = 'delete';

    // Calculate and update balances
    calculateAndUpdateBalances(group, expense, operation);

    // Settle group debts
    settleGroupDebts(group, operation);

    // Remove expense from group
    group.expenses = group.expenses.filter(expense => expense.toString() !== expenseId);

    await group.save();


    return res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
router.delete('/:expenseId', handleExpenseDeletion);

// Update Expense
async function handleExpenseUpdate(req, res) {
  try {
    const expenseId = req.params.expenseId;

    const expense = await findExpenseById(expenseId);
    
    if (!expenseId || !expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Find Group
    const group = await findGroupById(expense.groupId);
    if (!expense.groupId || !group) {
      return res.status(404).json({ message: "Expense Group couldn't be linked" });
    }

    // Group has expense or not
    const groupIncludesExpense = group.expenses.includes(expenseId);
    if (!groupIncludesExpense) {
      return res.status(404).json({ message: "Expense not found in group" });
    }

    //  Remove previous expense

    const oldExpense = req.body.oldExpenseData;

    // Find Old Expense Payer
    const payerUser = await findUserById(oldExpense.payer);
    if (!oldExpense.payer || !payerUser) {
      return res.status(404).json({ message: 'Previous Expense Payer not found' });
    }

    let operation = 'delete';

    // Calculate and update balances
    calculateAndUpdateBalances(group, expense, operation);

    // Settle group debts
    settleGroupDebts(group, operation);

    // Update Expense
    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      { $set: req.body.expenseData },
      { new: true }
    );

    // Add modified expense
    const newExpense = req.body.expenseData;

    // Find New Expense Payer
    const newPayerUser = await findUserById(newExpense.payer);
    if (!newExpense.payer || !newPayerUser) {
      return res.status(404).json({ message: 'New Expense Payer not found' });
    }

    operation = 'add';

    // Calculate and update balances
    calculateAndUpdateBalances(group, updatedExpense, operation);

    // Settle group debts
    settleGroupDebts(group, operation);

    // Updating expense details in group
    const index = group.expenses.findIndex(e => e.equals(updatedExpense._id));
    group.expenses[index] = updatedExpense;

    await group.save();

    await expense.save()

    return res.status(200).json({ message: 'Expense updated successfully', updatedExpense: updatedExpense });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
router.put('/:expenseId', handleExpenseUpdate)

module.exports = router;
