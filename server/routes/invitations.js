const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Invitation = require('../models/invitation');
const Group = require('../models/group');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();
const cors = require('cors');
const SibApiV3Sdk = require('@getbrevo/brevo');
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = process.env.BREVO_API_KEY;

router.use(cors());
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', '*');
    next();
});

// Function to send invitation email
const sendInviteEmail = async (senderName, recipientEmail) => {
    
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    
    sendSmtpEmail.templateId = process.env.BREVO_INVITE_TEMPLATE_ID;
    sendSmtpEmail.sender = { email: 'splititemail@gmail.com' };
    sendSmtpEmail.to = [{ email: recipientEmail }];
    
    sendSmtpEmail.params = {
        sender_name: senderName
    };

    try {
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`Invitation email sent to ${recipientEmail}`);
        return true;
    } catch (error) {
        console.error(`Failed to send invitation email to ${recipientEmail}:`, error.response ? error.response.text : error);
        return false;
    }
};

const { requireGroup } = require('../middleware/access');
const { route, fail, transaction } = require('../lib/http');
router.post('/invite',route(async(req,res)=>{
    if (typeof req.body.userEmail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.userEmail)) fail(400,'Enter a valid email address.');
    const sent = await sendInviteEmail(req.user.username,req.body.userEmail);
    if (!sent) fail(502,'Could not send invitation. Please try again.');
    res.json({message:'Invitation email sent successfully.'});
}));
router.post('/send',route(async(req,res)=>{
    const invitation = await transaction(async session=>{
        const group = await requireGroup(req.body.groupId,req.user._id,session);
        if (typeof req.body.userEmail !== 'string') fail(400,'Recipient email is required.');
        const user = await User.findOne({email:req.body.userEmail}).session(session);
        if (!user) fail(404,'User not in database.','user_not_found');
        if (group.members.some(m=>String(m.memberId)===String(user._id))) fail(409,'User is already in this group.','user_already_present');
        if (await Invitation.exists({groupId:group._id,recipientId:user._id,status:'pending'}).session(session)) fail(409,'User is already invited.','user_already_invited');
        const invitation = new Invitation({senderId:req.user._id,recipientId:user._id,groupId:group._id,groupName:group.name});
        await invitation.save({session});
        await User.updateOne({_id:user._id},{$push:{invitations:invitation._id}},{session});
        return invitation;
    });
    res.status(201).json({message:'Invitation sent successfully',invitation});
}));
async function respond(req,res,accept) {
    const groupId = await transaction(async session=>{
        if (!require('mongoose').isValidObjectId(req.body.invitationId)) fail(400,'Invalid invitation.');
        const invitation = await Invitation.findById(req.body.invitationId).session(session);
        if (!invitation || String(invitation.recipientId)!==String(req.user._id)) fail(403,'You do not have access to this invitation.');
        if (invitation.status!=='pending') fail(409,'This invitation has already been handled.');
        if (accept) {
            const group = await Group.findById(invitation.groupId).session(session);
            if (!group) fail(404,'Group not found.');
            if (!group.members.some(m=>String(m.memberId)===String(req.user._id))) {
                group.members.push({memberId:req.user._id,memberBalance:0});
                await group.save({session});
                await User.updateOne({_id:req.user._id},{$push:{groups:{groupId:group._id,groupName:group.name}}},{session});
            }
        }
        invitation.status = accept ? 'accepted' : 'declined';
        await invitation.save({session});
        await User.updateOne({_id:req.user._id},{$pull:{invitations:invitation._id}},{session});
        return invitation.groupId;
    });
    res.json({message:accept?'User added to the group successfully':'Invitation declined successfully',groupId});
}
router.post('/accept',route((req,res)=>respond(req,res,true)));
router.post('/decline',route((req,res)=>respond(req,res,false)));
module.exports = router;
