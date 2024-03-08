const express = require('express');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const session = require('express-session');
const path = require('path');
require('dotenv').config()



const CALLBACK_URL = 'http://localhost:3000/auth/discord/callback'; 

const app = express();
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'views')));
app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.use('/images', express.static(path.join(__dirname, 'images')));





app.use(session({
    secret: 'hello',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new DiscordStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: CALLBACK_URL,
    scope: ['identify', 'email', 'guilds', 'connections'] 
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const user = {
            id: profile.id,
            username: profile.username,
            discriminator: profile.discriminator,
            avatar: profile.avatar,
            locale: profile.locale,
            email: profile.email, 

        };
        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

app.get('/', (req, res) => {
    res.render('login');
});



app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback', passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => {
    res.redirect('/profile');
});

app.get('/profile', (req, res) => {
    const user = req.user;
    res.send(`
        <h1>Welcome, ${user.username}#${user.discriminator}</h1>
        <img src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png" alt="Avatar">
        <p>ID: ${user.id}</p>
        <p>Email: ${user.email || 'Not available'}</p>
        
      
    `);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
