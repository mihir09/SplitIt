const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/user');
const Group = require('../models/group');
const { route, fail } = require('../lib/http');
const { requireSelf } = require('../middleware/access');
const router = express.Router();
router.get('/:userEmail/groups',route(async(req,res)=>{
  requireSelf(req.params.userEmail,req.user);
  res.json(await Group.find({'members.memberId':req.user._id}));
}));
router.get('/email/:userEmail',route(async(req,res)=>{
  requireSelf(req.params.userEmail,req.user);
  res.json({name:req.user.username,email:req.user.email,id:req.user._id});
}));
router.get('/invitations/:userEmail',route(async(req,res)=>{
  requireSelf(req.params.userEmail,req.user);
  await req.user.populate({path:'invitations',match:{status:'pending'},populate:{path:'senderId',select:'username'}});
  res.json(req.user.invitations.map(i=>({id:i._id,senderName:i.senderId?.username || 'Former member',groupName:i.groupName})));
}));
router.get('/:userId',route(async(req,res)=>{
  if (!mongoose.isValidObjectId(req.params.userId)) fail(400,'Invalid user.');
  if (String(req.user._id)!==req.params.userId) {
    const shared = await Group.exists({'members.memberId':{$all:[req.user._id,new mongoose.Types.ObjectId(req.params.userId)]}});
    if (!shared) fail(403,'You do not have access to this user.');
  }
  const user = await User.findById(req.params.userId).select('username email');
  if (!user) fail(404,'User not found.');
  res.json({name:user.username,email:user.email,id:user._id});
}));
module.exports = router;
