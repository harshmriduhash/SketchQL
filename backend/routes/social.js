const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');


const handleSocialLogin = (req, res) => {
    const user = req.user;
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&username=${user.username}&userId=${user._id}`);
};


router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', 
    passport.authenticate('google', { session: false, failureRedirect: '/' }),
    handleSocialLogin
);


router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/auth/github/callback', 
    passport.authenticate('github', { session: false, failureRedirect: '/' }),
    handleSocialLogin
);

module.exports = router;