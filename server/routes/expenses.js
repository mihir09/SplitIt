const express = require('express');
const mongoose = require('mongoose');
const Expense = require('../models/expense');
const { requireGroup } = require('../middleware/access');
const { route, fail, transaction } = require('../lib/http');
const { validateExpense, applyExpense, rebuildBalances } = require('../lib/balances');
const router = express.Router();
const fields = ['expenseName','payer','expenseDate','description','amount','payerName','participants','splitType','category'];
function expenseInput(body) {
  return Object.fromEntries(fields.filter(key => Object.prototype.hasOwnProperty.call(body,key)).map(key => [key,body[key]]));
}
async function linkedExpense(id, userId, session) {
  if (!mongoose.isValidObjectId(id)) fail(400, 'Invalid expense.');
  const expense = await Expense.findById(id).session(session);
  if (!expense) fail(404, 'Expense not found.');
  const group = await requireGroup(expense.groupId, userId, session);
  if (!group.expenses.some(e => String(e) === String(id))) fail(404, 'Expense not found in group.');
  return {expense, group};
}
router.post('/', route(async (req,res) => {
  const expense = await transaction(async session => {
    const group = await requireGroup(req.body.groupId, req.user._id, session);
    const data = {...expenseInput(req.body), groupId:String(group._id)};
    validateExpense(data,group);
    const expense = new Expense(data);
    await expense.save({session});
    group.expenses.push(expense._id);
    applyExpense(group,expense,1);
    rebuildBalances(group);
    await group.save({session});
    return expense;
  });
  res.status(201).json(expense);
}));
async function remove(req,res,undo) {
  await transaction(async session => {
    const {expense,group} = await linkedExpense(req.params.expenseId, req.user._id, session);
    applyExpense(group,expense,-1);
    group.expenses = group.expenses.filter(id=>String(id)!==String(expense._id));
    rebuildBalances(group);
    await group.save({session});
    await Expense.deleteOne({_id:expense._id},{session});
  });
  res.json({message:undo?'Expense undone successfully':'Expense deleted successfully'});
}
router.delete('/:expenseId',route((req,res)=>remove(req,res,false)));
router.post('/undo/:expenseId',route((req,res)=>remove(req,res,true)));
router.put('/:expenseId',route(async (req,res)=>{
  const updatedExpense = await transaction(async session=>{
    const {expense,group} = await linkedExpense(req.params.expenseId,req.user._id,session);
    const input = req.body.expenseData;
    if (!input || typeof input !== 'object') fail(400,'Expense details are required.');
    if (input.groupId && String(input.groupId)!==String(group._id)) fail(400,'An expense cannot be moved to another group.');
    const data = {...expense.toObject(),...expenseInput(input)};
    validateExpense(data,group);
    applyExpense(group,expense,-1);
    expense.set(expenseInput(data));
    await expense.save({session});
    applyExpense(group,expense,1);
    rebuildBalances(group);
    await group.save({session});
    return expense;
  });
  res.json({message:'Expense updated successfully',updatedExpense});
}));
module.exports = router;
