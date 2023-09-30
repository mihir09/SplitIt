
const express = require('express');
const router = express.Router();
const Group = require('../models/group');
const User = require('../models/user');

// Create a new group
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    const existingGroup = await Group.findOne({ name });
    if (existingGroup) {
      return res.status(400).json({ message: 'Group name is already in use. Please choose a different name.' });
    }

    const group = new Group({ name });
    await group.save();

    return res.status(201).json(group);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Add user to a group by email
router.post('/:groupId/addUserByEmail', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userEmail } = req.body;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const user = await User.findOne({ email: userEmail });

    if (user) {
      if (!group.members.includes(user._id)) {
        group.members.push(user._id);
        user.groups.push({groupId:group._id, groupName: group.name});
        await user.save();
      }
      else{
        return res.status(404).json({ message: 'User already present in group.'})
      }
    } else {
      return res.status(404).json({ message: 'User not found. Please re-check the email' })
    }

    await group.save();

    return res.status(200).json({ message: 'Users added to the group successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


// Fetch group details
router.get('/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    return res.status(201).json(group);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
