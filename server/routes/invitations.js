const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Invitation = require('../models/invitation');
const Group = require('../models/group');

// Send Group Invitation
router.post('/send', async (req, res) => {
    try {
        const { senderEmail, userEmail, groupId } = req.body;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const sender = await User.findOne({ email: senderEmail });
        const user = await User.findOne({ email: userEmail }).populate('invitations');

        if (!user || !sender) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (group.members.some((member) => member.memberId.equals(user._id))) {
            return res.status(400).json({ message: 'User already present in group' });
        }
        
        if (user.invitations.some(invitation => invitation.groupId.equals(groupId))) {
            return res.status(400).json({ message: 'User already invited to this group' });
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

        return res.status(200).json({ message: 'User added to the group successfully' });
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
