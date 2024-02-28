const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Invitation = require('../models/invitation');
const Group = require('../models/group');
const sgMail = require('@sendgrid/mail');
const cors = require('cors');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.use(cors());

// Function to send invitation email
const sendInviteEmail = async (senderName, recipientEmail) => {
    const msg = {
        to: recipientEmail,
        from: 'splititmail@gmail.com',
        templateId: process.env.SENDGRID_TEMPLATE_ID,
        dynamicTemplateData: {
            sender_name: senderName,
        }
    };

    try {
        await sgMail.send(msg);
        console.log(`Invitation email sent to ${recipientEmail}`);
        return true;
    } catch (error) {
        console.error(`Failed to send invitation email to ${recipientEmail}:`, error);
        return false;
    }
};

// Sending invite emails
router.post('/invite', async (req, res) => {
    try {
        const { senderEmail, userEmail } = req.body;
        const sender = await User.findOne({ email: senderEmail })

        if (!sender) {
            return res.status(404).json({
                message: 'Could not be authroized.',
                type: 'sender_not_found',
                suggestion: 'Please log in again to send invites.'
            });
        }

        const emailSent = await sendInviteEmail(sender.username, userEmail);
        if (!emailSent) {
            throw new Error('Failed to send invitation email.');
        }

        res.status(200).json({ message: 'Invitation email sent successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Send Group Invitation
router.post('/send', async (req, res) => {
    try {
        const { senderEmail, userEmail, groupId } = req.body;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({
                message: 'Group not found. Please select a valid group to proceed.',
                type: 'group_not_found',
                suggestion: 'Please choose a different group or create a new one.'
            });
        }

        const sender = await User.findOne({ email: senderEmail });
        const user = await User.findOne({ email: userEmail }).populate('invitations');

        if (!sender) {
            return res.status(404).json({
                message: 'Could not be authroized.',
                type: 'sender_not_found',
                suggestion: 'Please log in again to send invites.'
            });
        }

        if (!user) {
            return res.status(404).json({
                message: 'User not in database.',
                type: 'user_not_found',
                suggestion: 'Would you like to invite them to SplitIt?'
            });
        }

        if (group.members.some((member) => member.memberId.equals(user._id))) {
            return res.status(409).json({ 
                message: 'User already present in group.',
                type: 'user_already_present',
                suggestion: 'Looks like someone snuck in! Let\'s SplitIt.' 
            });
        }

        if (user.invitations.some(invitation => invitation.groupId.equals(groupId))) {
            return res.status(409).json({ 
                message: 'User already invited to this group.',
                type: 'user_already_invited',
                suggestion: 'Looks like someone\'s quite popular or has a lot to payback.', 
            });
        }

        const invitation = await Invitation.create({ senderId: sender._id, recipientId: user._id, groupName: group.name, groupId });

        await User.findOneAndUpdate(
            { _id: user._id },
            { $push: { invitations: invitation._id } }
        );

        res.status(201).json({ message: 'Invitation sent successfully', invitation });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Accept Group Invitation
router.post('/accept', async (req, res) => {
    try {
        const { invitationId, userEmail } = req.body;

        const invitation = await Invitation.findById(invitationId);

        if (!invitation) {
            return res.status(404).json({ message: 'Invitation not found' });
        }

        const user = await User.findOne({ email: userEmail });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (invitation.recipientId.toString() !== user._id.toString()) {
            console.log(invitation.recipientId, user._id)
            return res.status(403).json({ message: 'Invalid user for this invitation' });
        }

        const group = await Group.findById(invitation.groupId);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (!group.members.some((member) => member.memberId.equals(user._id))) {
            group.members.push({ memberId: user._id, memberBalance: 0 });
            user.groups.push({ groupId: group._id, groupName: group.name });
            await user.save();
        } else {
            return res.status(400).json({ message: 'User already present in group' });
        }

        invitation.status = 'accepted';
        await invitation.save();

        await User.findByIdAndUpdate(
            { _id: invitation.recipientId },
            { $pull: { invitations: invitation._id } }
        );

        await group.save();

        return res.status(200).json({ message: 'User added to the group successfully', groupId: group._id });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Decline Group Invitation
router.post('/decline', async (req, res) => {
    try {
        const { invitationId, userEmail } = req.body;

        const invitation = await Invitation.findById(invitationId);

        if (!invitation) {
            return res.status(404).json({ message: 'Invitation not found' });
        }

        const user = await User.findOne({ email: userEmail });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (invitation.recipientId.toString() !== user._id.toString()) {
            return res.status(403).json({ message: 'Invalid user for this invitation' });
        }

        invitation.status = 'declined';
        await invitation.save();

        await User.findByIdAndUpdate(
            { _id: invitation.recipientId },
            { $pull: { invitations: invitation._id } }
        );

        res.status(200).json({ message: 'Invitation declined successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
