const express = require('express');
const Group = require('../models/group');
const User = require('../models/user');
const { requireGroup } = require('../middleware/access');
const { route, fail, transaction } = require('../lib/http');
const { cents } = require('../lib/balances');
const router = express.Router();
router.use('/expenses',require('./expenses'));
router.post('/',route(async(req,res)=>{
  if (typeof req.body.name !== 'string' || !req.body.name.trim()) fail(400,'Group name is required.');
  const group = await transaction(async session=>{
    const group = new Group({name:req.body.name.trim(),members:[{memberId:req.user._id,memberBalance:0}]});
    await group.save({session});
    await User.updateOne({_id:req.user._id},{$push:{groups:{groupId:group._id,groupName:group.name}}},{session});
    return group;
  });
  res.status(201).json(group);
}));
router.post('/:groupId/addUserByEmail',route(async(req,res)=>{
  await requireGroup(req.params.groupId,req.user._id);
  // Membership is granted through an invitation accepted by its recipient.
  if (req.body.userEmail !== req.user.email) fail(403,'Send a group invitation to add another member.');
  res.json({message:'You are already a member of this group.'});
}));
router.get('/:groupId',route(async(req,res)=>{
  const group = await requireGroup(req.params.groupId,req.user._id);
  res.json(group);
}));
router.get('/:groupId/expenses',route(async(req,res)=>{
  const group = await requireGroup(req.params.groupId,req.user._id);
  await group.populate('expenses');
  res.json(group.expenses);
}));
router.post('/:groupId/transaction/:transactionId',route(async(req,res)=>{
  await transaction(async session=>{
    const group = await requireGroup(req.params.groupId,req.user._id,session);
    const payment = group.balance.find(t=>String(t._id)===req.params.transactionId);
    if (!payment) fail(404,'Payment not found or already recorded. Refresh the balances.');
    const debtor = group.members.find(m=>String(m.memberId)===String(payment.from));
    const creditor = group.members.find(m=>String(m.memberId)===String(payment.to));
    if (!debtor || !creditor) fail(409,'Payment members are missing.');
    const value = cents(payment.balance);
    if (value<=0 || value > -cents(debtor.memberBalance) || value > cents(creditor.memberBalance)) fail(409,'This payment is out of date. Refresh the balances.');
    debtor.memberBalance = (cents(debtor.memberBalance)+value)/100;
    creditor.memberBalance = (cents(creditor.memberBalance)-value)/100;
    // Preserve IDs of other displayed payments so concurrent stale requests fail safely.
    group.balance = group.balance.filter(t=>String(t._id)!==String(payment._id));
    await group.save({session});
  });
  res.json({message:'Payment recorded'});
}));
module.exports = router;
