// Getting required modules
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cors = require('cors');
const User = require('./models/user');

// Creating express app
const app = express();
app.use(express.json());

// CORS access to angular
app.use(cors());

// MongoDb database setup
// mongoose.connect('mongodb://127.0.0.1:27017/SplitIt', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// });

const uri = process.env.MONGODB_URI;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', '*');
    next();
});

// User registration
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'Email address is already in use. Please login to continue.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ username, email, password: hashedPassword });
        await user.save();

        const currentUser = await User.findOne({ email });

        const token = jwt.sign({ userId: currentUser._id }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '1h',
        });

        return res.status(200).json({ token: token, message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// User login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'User not found. Please verify the email address.' });
        }

        const isPasswordValid = bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Incorrect password. Please verify it.' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '1h',
        });

        return res.status(200).json({ token: token, message: 'Successfully Logged In.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Forget Password
app.post('/api/reset-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(400).json({ message: 'Email not in our system. Please register to continue.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ username, email, password: hashedPassword });
        await user.save();

        const currentUser = await User.findOne({ email });

        const token = jwt.sign({ userId: currentUser._id }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '1h',
        });

        return res.status(200).json({ token: token, message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

const groupsRouter = require('./routes/groups');
app.use('/api/groups', groupsRouter);

const invitationsRouter = require('./routes/invitations');
app.use('/api/invitations', invitationsRouter);

const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);

const expensesRouter = require('./routes/expenses');
app.use('/api/expenses', expensesRouter);

// Listening on port 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
