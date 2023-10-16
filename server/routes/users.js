const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Get all groups of a user by user Email
router.get('/:userEmail/groups', async (req, res) => {
    try {
        const { userEmail } = req.params;

        const user = await User.findOne({ email: userEmail }).populate('groups');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const groups = user.groups;

        return res.status(200).json(groups);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Get user details by user Id
router.get('/:userId', async (req, res) => {
    try {
        
        const { userId } = req.params;
        const user = await User.findOne({ _id: userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userDetails = {name: user.username, email: user.email, id: user._id};
        return res.status(200).json(userDetails);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Get user details by user Email
router.get('/email/:userEmail', async (req, res) => {
    try {
        const { userEmail } = req.params;

        const user = await User.findOne({ email: userEmail })

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userDetails = {name: user.username, email: user.email, id: user._id};
        return res.status(200).json(userDetails);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
