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

module.exports = router;
