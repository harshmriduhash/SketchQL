const router = require('express').Router();
const User = require('../models/Users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
    try {
        
        const userExists = await User.findOne({ email: req.body.email });
        if (userExists) return res.status(400).json({ error: "Email already exists" });

        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        });

        
        const savedUser = await newUser.save();
        res.status(201).json({ message: "User created!", userId: savedUser._id });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.post('/login', async (req, res) => {
    try {
        
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(400).json({ error: "Email is not found" });

        
        const validPass = await bcrypt.compare(req.body.password, user.password);
        if (!validPass) return res.status(400).json({ error: "Invalid password" });

        
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        
       
        res.json({ 
            token: token, 
            username: user.username,
            userId: user._id
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;