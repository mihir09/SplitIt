
const express = require('express');
const router = express.Router();
const Group = require('../models/group');
const User = require('../models/user');

const expenseRouter = require('./expenses');
router.use('/expenses', expenseRouter);

// Create a new group
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    const existingGroup = await Group.findOne({ name });
    if (existingGroup) {
      return res.status(400).json({ message: 'Group name is already in use. Please choose a different name.' });
    }

    const group = new Group({ name });
    await group.save();

    return res.status(201).json(group);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Add user to a group by email
router.post('/:groupId/addUserByEmail', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userEmail } = req.body;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const user = await User.findOne({ email: userEmail });

    if (user) {
      if (!group.members.some((member) => member.memberId.equals(user._id))) {
        group.members.push({memberId:user._id, memberBalance: 0});
        user.groups.push({groupId:group._id, groupName: group.name});
        await user.save();
      }
      else{
        return res.status(404).json({ message: 'User already present in group.'})
      }
    } else {
      return res.status(404).json({ message: 'User not found. Please re-check the email' })
    }

    await group.save();

    return res.status(200).json({ message: 'Users added to the group successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Fetch group details
router.get('/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    return res.status(201).json(group);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Fetch expenses in group
router.get('/:groupId/expenses', async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId).populate('expenses');
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const expenses = group.expenses
    return res.status(201).json(expenses);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Settle transaction
router.post('/:groupId/transaction/:transactionId', async (req, res) => {
  try {
    const { groupId, transactionId } = req.params;
    const group = await Group.findById(groupId)
    const transactionIndex = group.balance.findIndex(
      (transaction) => transaction._id.toString() === transactionId
    );

    if (transactionIndex === -1) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    // console.log(group.balance[transactionIndex])


    // console.log('debtor', group.members.find(member => member.memberId.toString() == group.balance[transactionIndex].from))
    debtor = group.members.find(member => member.memberId.toString() == group.balance[transactionIndex].from)
    debtor.memberBalance += group.balance[transactionIndex].balance;
    debtor.memberBalance = Number(debtor.memberBalance).toFixed(2);
    // console.log(debtor.memberBalance)

    // console.log('creditor', group.members.find(member => member.memberId.toString() == group.balance[transactionIndex].to))
    creditor = group.members.find(member => member.memberId.toString() == group.balance[transactionIndex].to)
    creditor.memberBalance -= group.balance[transactionIndex].balance;
    creditor.memberBalance = Number(creditor.memberBalance).toFixed(2);
    // console.log(creditor.memberBalance)

    group.balance.splice(transactionIndex, 1);
    await group.save()
    
    return res.status(200).json({ message: 'Transaction settled' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
