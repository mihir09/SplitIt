const mongoose = require('mongoose');

// OTP schema
const Schema = mongoose.Schema;
const otpSchema = new Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    expiration: { type: Date, required: true }
});

module.exports = mongoose.model('OTP', otpSchema);