const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
        lowercase: true
    },
    password: { 
        type: String, 
        minlength: 6 
    },
    googleId: {
        type: String 
    }, 
    githubId: { 
        type: String 
    }, 
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);