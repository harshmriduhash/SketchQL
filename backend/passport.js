
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;


const User = require('./models/Users'); 


const generateUsername = (profile) => {
    if (profile.username) return profile.username;
    if (profile._json && profile._json.login) return profile._json.login;
    if (profile.displayName) return profile.displayName.replace(/\s+/g, '_'); 
    if (profile.emails && profile.emails.length > 0) {
        return profile.emails[0].value.split('@')[0];
    }
    return `user_${profile.id}`;
};


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://sketchql-backend.onrender.com/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
        const safeUsername = generateUsername(profile);
        const email = profile.emails[0].value;

        
        let user = await User.findOne({ googleId: profile.id });
        if (user) return done(null, user);

        user = await User.findOne({ email: email });
        if (user) {
            console.log("Found existing user by email (Google). Updating...");
            user.googleId = profile.id;
            
            if (!user.username) user.username = safeUsername; 
            await user.save();
            return done(null, user);
        }

        console.log("Creating new Google user:", safeUsername);
        user = new User({
            username: safeUsername,
            email: email,
            googleId: profile.id,
        });
        await user.save();
        done(null, user);
        
    } catch (err) {
        
        done(err, null);
    }
  }
));


passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "https://sketchql-backend.onrender.com/auth/github/callback",
    scope: ['user:email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {

        const safeUsername = generateUsername(profile);
        
        const email = (profile.emails && profile.emails[0]) 
            ? profile.emails[0].value 
            : `${safeUsername}@no-email.github.com`;


        let user = await User.findOne({ githubId: profile.id });
        if (user) {
            
            return done(null, user);
        }

        user = await User.findOne({ email: email });
        if (user) {

            user.githubId = profile.id;
            
            
            if (!user.username || user.username.trim() === "") {
                
                user.username = safeUsername;
            }
            
            
            await user.save();
 
            return done(null, user);
        }

        
        user = new User({
            username: safeUsername,
            email: email,
            githubId: profile.id,
        });
        
        await user.save();

        done(null, user);

    } catch (err) {
        done(err, null);
    }
  }
));
