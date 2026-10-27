const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/user');
const Group = require('../models/group');
const { fail } = require('../lib/http');
async function authenticate(req, res, next) {
  try {
    const match = /^Bearer (\S+)$/.exec(req.get('Authorization') || '');
    if (!match) return res.status(401).json({ message: 'Please log in to continue.' });
    let token;
    try { token = jwt.verify(match[1], process.env.ACCESS_TOKEN_SECRET, { algorithms: ['HS256'] }); }
    catch (_) { return res.status(401).json({ message: 'Your session has expired. Please log in again.' }); }
    if (!mongoose.isValidObjectId(token.userId)) return res.status(401).json({ message: 'Invalid session.' });
    req.user = await User.findById(token.userId).select('-password');
    if (!req.user) return res.status(401).json({ message: 'Please log in again.' });
    next();
  } catch (error) { next(error); }
}
function member(group, userId) {
  return group.members.some(m => String(m.memberId) === String(userId));
}
async function requireGroup(groupId, userId, session = null) {
  if (!mongoose.isValidObjectId(groupId)) fail(400, 'Invalid group.');
  const group = await Group.findById(groupId).session(session);
  if (!group || !member(group, userId)) fail(403, 'You do not have access to this group.');
  return group;
}
function requireSelf(email, user) {
  if (email !== user.email) fail(403, 'You do not have access to this account.');
}
module.exports = { authenticate, requireGroup, requireSelf, member };
