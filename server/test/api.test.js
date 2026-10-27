const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryReplSet } = require('mongodb-memory-server-core');
const User = require('../models/user');
const Group = require('../models/group');
const Expense = require('../models/expense');
const Invitation = require('../models/invitation');
let db, server, base, alice, bob, outsider, group, token, outsideToken;
async function request(path, {method='GET', body, auth=token}={}) {
  const response = await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(auth?{Authorization:`Bearer ${auth}`}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});
  return {status:response.status, body:await response.json()};
}
function data(overrides={}) { return {expenseName:'Dinner',amount:10,payer:String(alice._id),groupId:String(group._id),participants:{[alice._id]:3.34,[bob._id]:6.66},...overrides}; }
before(async()=>{
  db = await MongoMemoryReplSet.create({replSet:{count:1}});
  process.env.MONGODB_URI=db.getUri(); process.env.ACCESS_TOKEN_SECRET='isolated-test-secret';
  await mongoose.connect(process.env.MONGODB_URI);
  await Promise.all([User.init(),Group.init(),Expense.init(),Invitation.init()]);
  [alice,bob,outsider]=await User.create([{username:'Alice',email:'alice@example.test',password:await require('bcrypt').hash('local-test-password',4)},{username:'Bob',email:'bob@example.test',password:'unused'},{username:'Other',email:'other@example.test',password:'unused'}]);
  group=await Group.create({name:'Test group',members:[{memberId:alice._id,memberBalance:0},{memberId:bob._id,memberBalance:0}]});
  token=jwt.sign({userId:alice._id},process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'});
  outsideToken=jwt.sign({userId:outsider._id},process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'});
  const app=require('../server');
  server=app.listen(0,'127.0.0.1'); await new Promise(resolve=>server.once('listening',resolve));
  base=`http://127.0.0.1:${server.address().port}`;
});
after(async()=>{if(server) await new Promise(resolve=>server.close(resolve));await mongoose.disconnect();if(db)await db.stop();});
test('protected API rejects anonymous, forged and expired tokens',async()=>{
  for(const path of ['/api/groups/'+group._id,'/api/users/'+alice._id,'/api/users/alice@example.test/groups','/api/users/invitations/alice@example.test']) assert.equal((await request(path,{auth:null})).status,401);
  for(const path of ['/api/groups','/api/expenses','/api/invitations/send']) assert.equal((await request(path,{method:'POST',body:{},auth:null})).status,401);
  assert.equal((await request('/api/groups/'+group._id,{auth:'fake'})).status,401);
  const expired=jwt.sign({userId:alice._id},process.env.ACCESS_TOKEN_SECRET,{expiresIn:-1});
  assert.equal((await request('/api/groups/'+group._id,{auth:expired})).status,401);
  assert.equal((await request('/api/health',{auth:null})).status,200);
});
test('outsiders cannot read or mutate groups, user data or invitations',async()=>{
  for(const path of ['/api/groups/'+group._id,'/api/groups/'+group._id+'/expenses','/api/users/'+alice._id,'/api/users/alice@example.test/groups','/api/users/invitations/alice@example.test']) assert.equal((await request(path,{auth:outsideToken})).status,403);
  assert.equal((await request('/api/expenses',{method:'POST',body:data(),auth:outsideToken})).status,403);
  assert.equal((await request('/api/invitations/send',{method:'POST',body:{groupId:group._id,userEmail:bob.email,senderEmail:alice.email},auth:outsideToken})).status,403);
  assert.equal((await request('/api/groups/'+group._id+'/addUserByEmail',{method:'POST',body:{userEmail:outsider.email}})).status,403);
  assert.equal((await request('/api/users/'+bob._id)).status,200);
});
test('group creation includes creator and legacy self-add remains idempotent',async()=>{
  const created=await request('/api/groups',{method:'POST',body:{name:'New group',creatorEmailId:outsider.email}});
  assert.equal(created.status,201);assert.equal(String(created.body.members[0].memberId),String(alice._id));
  assert.equal((await request('/api/groups/'+created.body._id+'/addUserByEmail',{method:'POST',body:{userEmail:alice.email}})).status,200);
  assert.equal((await Group.findById(created.body._id)).members.length,1);
});
test('invalid splits and payers are rejected without leaving expenses',async()=>{
  const before=await Expense.countDocuments();
  for(const input of [data({participants:{[alice._id]:3.33,[bob._id]:6.66}}),data({payer:String(outsider._id)}),data({participants:{[outsider._id]:10}}),data({amount:-1}),data({participants:{[alice._id]:-1,[bob._id]:11}}),data({amount:10.001})]) assert.equal((await request('/api/expenses',{method:'POST',body:input})).status,400);
  assert.equal(await Expense.countDocuments(),before);
});
test('create/edit/delete preserve exact totals; invalid edit changes nothing',async()=>{
  const created=await request('/api/expenses',{method:'POST',body:data()});assert.equal(created.status,201);
  const id=created.body._id;
  let current=await Group.findById(group._id);assert.deepEqual(current.members.map(m=>m.memberBalance),[6.66,-6.66]);
  assert.equal((await request('/api/expenses/'+id,{method:'PUT',body:{expenseData:data({payer:String(outsider._id)})}})).status,400);
  assert.equal((await Expense.findById(id)).amount,10);
  assert.equal((await request('/api/expenses/'+id,{method:'PUT',body:{expenseData:data({amount:12,participants:{[alice._id]:6,[bob._id]:6}})}})).status,200);
  current=await Group.findById(group._id);assert.deepEqual(current.members.map(m=>m.memberBalance),[6,-6]);
  assert.equal((await request('/api/expenses/'+id,{method:'DELETE',auth:outsideToken})).status,403);
  assert.equal((await request('/api/expenses/'+id,{method:'DELETE'})).status,200);
  current=await Group.findById(group._id);assert.deepEqual(current.members.map(m=>m.memberBalance),[0,0]);assert.equal(await Expense.findById(id),null);
});
test('database failure after saving an expense rolls back both documents',async()=>{
  const before=await Expense.countDocuments();const original=Group.prototype.save;
  Group.prototype.save=async function(){throw new Error('simulated group save failure');};
  try {assert.equal((await request('/api/expenses',{method:'POST',body:data()})).status,500);}
  finally {Group.prototype.save=original;}
  assert.equal(await Expense.countDocuments(),before);
  assert.deepEqual((await Group.findById(group._id)).members.map(m=>m.memberBalance),[0,0]);
});
test('concurrent expense writes do not lose balance changes; duplicate settlement is rejected',async()=>{
  const created=await Promise.all([request('/api/expenses',{method:'POST',body:data()}),request('/api/expenses',{method:'POST',body:data()})]);
  assert(created.every(r=>r.status===201));
  let current=await Group.findById(group._id);assert.deepEqual(current.members.map(m=>m.memberBalance),[13.32,-13.32]);
  const path='/api/groups/'+group._id+'/transaction/'+current.balance[0]._id;
  const responses=await Promise.all([request(path,{method:'POST',body:{}}),request(path,{method:'POST',body:{}})]);
  assert.deepEqual(responses.map(r=>r.status).sort(),[200,404]);
  current=await Group.findById(group._id);assert.deepEqual(current.members.map(m=>m.memberBalance),[0,0]);
});
test('historical amounts are preserved rather than silently discarding cents',async()=>{
  const legacy=await Group.create({name:'Legacy group',members:[{memberId:alice._id,memberBalance:1},{memberId:bob._id,memberBalance:-0.99}],balance:[{from:bob._id,to:alice._id,balance:0.99}]});
  const result=await request('/api/groups/'+legacy._id);assert.equal(result.status,200);
  assert.equal((await request('/api/groups/'+legacy._id+'/transaction/'+legacy.balance[0]._id,{method:'POST',body:{}})).status,200);
  assert.deepEqual((await Group.findById(legacy._id)).members.map(m=>m.memberBalance),[0.01,0]);
});
test('invitation identity comes from token; only recipient can accept',async()=>{
  const sent=await request('/api/invitations/send',{method:'POST',body:{groupId:group._id,userEmail:outsider.email,senderEmail:bob.email}});assert.equal(sent.status,201);assert.equal(String(sent.body.invitation.senderId),String(alice._id));
  assert.equal((await request('/api/invitations/accept',{method:'POST',body:{invitationId:sent.body.invitation._id,userEmail:outsider.email}})).status,403);
  assert.equal((await request('/api/invitations/accept',{method:'POST',auth:outsideToken,body:{invitationId:sent.body.invitation._id,userEmail:alice.email}})).status,200);
  assert((await Group.findById(group._id)).members.some(m=>String(m.memberId)===String(outsider._id)));
  assert.equal((await request('/api/invitations/accept',{method:'POST',auth:outsideToken,body:{invitationId:sent.body.invitation._id}})).status,409);
});

test('public authentication rejects query objects before database queries',async()=>{
  for (const [path,body] of [['/api/login',{email:{$ne:null},password:'test'}],['/api/register',{username:'x',email:{$ne:null},password:'test'}],['/api/reset-password',{email:{$ne:null}}],['/api/reset-password/verify',{email:'alice@example.test',otp:{$ne:null},newPassword:'test'}]]) assert.equal((await request(path,{method:'POST',body,auth:null})).status,400);
});

test('login and registration issue tokens that work with protected routes',async()=>{
  const login=await request('/api/login',{method:'POST',auth:null,body:{email:alice.email,password:'local-test-password'}});
  assert.equal(login.status,200);
  assert.equal((await request('/api/groups/'+group._id,{auth:login.body.token})).status,200);
  const registered=await request('/api/register',{method:'POST',auth:null,body:{username:'New user',email:'new@example.test',password:'local-test-password'}});
  assert.equal(registered.status,200);
  assert.equal((await request('/api/users/email/new@example.test',{auth:registered.body.token})).status,200);
});

test('an expense edit rolls back the saved expense if the balance update fails',async()=>{
  const created=await request('/api/expenses',{method:'POST',body:data()});assert.equal(created.status,201);
  const id=created.body._id;
  const before=(await Group.findById(group._id)).members.map(m=>m.memberBalance);
  const original=Group.prototype.save;
  Group.prototype.save=async function(){throw new Error('simulated edit balance failure');};
  try {
    assert.equal((await request('/api/expenses/'+id,{method:'PUT',body:{expenseData:data({amount:12,participants:{[alice._id]:6,[bob._id]:6}})}})).status,500);
  } finally {Group.prototype.save=original;}
  assert.equal((await Expense.findById(id)).amount,10);
  assert.deepEqual((await Group.findById(group._id)).members.map(m=>m.memberBalance),before);
  assert.equal((await request('/api/expenses/undo/'+id,{method:'POST',body:{}})).status,200);
  assert.equal(await Expense.findById(id),null);
});
