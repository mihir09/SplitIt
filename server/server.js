// Getting required modules
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cors = require('cors');
const User = require('./models/user');
const OTP = require('./models/otp');
const sgMail = require('@sendgrid/mail');
const SibApiV3Sdk = require('@getbrevo/brevo');
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Creating express app
const app = express();
app.use(express.json());

// CORS access to angular
app.use(cors());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', '*');
    next();
});



const uri = process.env.MONGODB_URI;
let apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = process.env.BREVO_API_KEY;

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
            return res.status(404).json({ 
                message: 'User not found. Please verify the email address.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                type: 'incorrect_password',
                message: 'Incorrect password. Please try again.',
                suggestion: "Oops! Password slipped your mind? No biggie, happens to everyone! Just tap that reset button and let's work our magic to get you back in action" });
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

// Forgot Password
app.post('/api/reset-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ message: 'Email not in our system.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiration = new Date();
        expiration.setMinutes(expiration.getMinutes() + 10);

        await OTP.create({ email, otp, expiration });
        
        const resetLink = `https://splititapp.netlify.app/reset-password?email=${email}&otp=${otp}`;
        
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        
        sendSmtpEmail.subject = 'Password Reset OTP';
        sendSmtpEmail.sender = { email: 'splititemail@gmail.com' };
        sendSmtpEmail.to = [{ email: email }];
        
        sendSmtpEmail.textContent = `Your OTP is: ${otp}`;
        sendSmtpEmail.htmlContent = `<p>Your OTP is: <strong>${otp}</strong></p><a href="${resetLink}">Reset Link</a>`;
        
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        
        return res.status(200).json({ message: 'Reset OTP sent successfully.' });
    } catch (error) {
        console.error('Password Reset Error:', error.response ? error.response.text : error);
        return res.status(500).json({ message: 'Internal server error. Check server logs for details.' });
    }
});

// Validate OTP and reset password
app.post('/api/reset-password/verify', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'Please provide email, OTP, and new password.' });
        }

        const otpData = await OTP.findOne({ email, otp, expiration: { $gt: new Date() } });

        if (otpData) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await User.updateOne({ email }, { password: hashedPassword });

            await OTP.deleteOne({ email, otp });

            return res.status(200).json({ message: 'Password reset successfully.' });
        } else {
            return res.status(400).json({ message: 'Invalid or expired OTP. Please try again.' });
        }
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
