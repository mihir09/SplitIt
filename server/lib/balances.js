const { fail } = require('./http');
function cents(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) fail(400, 'Amounts must be numbers.');
  const result = Math.round(value * 100);
  if (!Number.isSafeInteger(result) || Math.abs(value * 100 - result) > 0.00001) fail(400, 'Amounts must have at most two decimal places.');
  return result;
}
function participantsOf(expense) {
  return expense.participants instanceof Map ? [...expense.participants.entries()] : Object.entries(expense.participants || {});
}
function validateExpense(data, group) {
  const amount = cents(data.amount);
  if (amount <= 0) fail(400, 'Enter an expense amount greater than zero.');
  if (typeof data.expenseName !== 'string' || !data.expenseName.trim()) fail(400, 'Expense name is required.');
  if (!group.members.some(m => String(m.memberId) === String(data.payer))) fail(400, 'Payer must be a group member.');
  const entries = participantsOf(data);
  if (!entries.length) fail(400, 'Choose at least one participant.');
  let total = 0;
  for (const [id, value] of entries) {
    if (!group.members.some(m => String(m.memberId) === id)) fail(400, 'Participants must be group members.');
    const share = cents(value);
    if (share < 0) fail(400, 'Participant amounts cannot be negative.');
    total += share;
  }
  if (!Number.isSafeInteger(total) || total !== amount) fail(400, 'Participant amounts must add up to the expense total.');
  if (data.expenseDate && !Number.isFinite(new Date(data.expenseDate).getTime())) fail(400, 'Invalid expense date.');
}
function applyExpense(group, expense, direction) {
  const payer = group.members.find(m => String(m.memberId) === String(expense.payer));
  if (!payer) fail(409, 'Expense payer is missing from this group.');
  for (const [id, value] of participantsOf(expense)) {
    const participant = group.members.find(m => String(m.memberId) === id);
    if (!participant) fail(409, 'An expense participant is missing from this group.');
    participant.memberBalance = (cents(participant.memberBalance) - direction * cents(value)) / 100;
  }
  payer.memberBalance = (cents(payer.memberBalance) + direction * cents(expense.amount)) / 100;
}
function rebuildBalances(group) {
  const debtors = group.members.map(m => ({id:m.memberId, value:cents(m.memberBalance)})).filter(m => m.value < 0).sort((a,b)=>a.value-b.value);
  const creditors = group.members.map(m => ({id:m.memberId, value:cents(m.memberBalance)})).filter(m => m.value > 0).sort((a,b)=>b.value-a.value);
  const balances = [];
  let d=0, c=0;
  while (d < debtors.length && c < creditors.length) {
    const value = Math.min(-debtors[d].value, creditors[c].value);
    balances.push({from:debtors[d].id, to:creditors[c].id, balance:value / 100});
    debtors[d].value += value; creditors[c].value -= value;
    if (!debtors[d].value) d++;
    if (!creditors[c].value) c++;
  }
  group.balance = balances;
}
module.exports = { cents, validateExpense, applyExpense, rebuildBalances };
