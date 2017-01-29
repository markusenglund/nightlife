const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const mongoose = require('mongoose');
const session = require('express-session');

const index = require('./routes/index');
const users = require('./routes/users');
const User = require('./models/user');
const secrets = require('./secrets')
const TWITTER_CONSUMER_KEY = secrets.twitterKey
const TWITTER_CONSUMER_SECRET = secrets.twitterSecret
const app = express();
mongoose.connect("mongodb://markus:markus@ds163738.mlab.com:63738/nightlife-app") //should be secret!

passport.serializeUser( (user, done) => {
    done(null, user.id);
});

passport.deserializeUser( (id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    })
})

passport.use(new TwitterStrategy({
        consumerKey: TWITTER_CONSUMER_KEY,
        consumerSecret: TWITTER_CONSUMER_SECRET,
        callbackURL: "https://nightlife-yogaboll.herokuapp.com//auth/twitter/callback"
    },
    (token, tokenSecret, profile, done) => {
        console.log("passport cb called")
        User.findOne({ twitterId: profile.id }, (err, user) => {
            console.log("Calling database")
            if (!user) {
                console.log("Creating new user")
                let newUser = new User({
                    name: profile.displayName,
                    twitterId: profile.id
                })
                newUser.save( (err) => {
                    return done(err, newUser)
                })
            } else {
                console.log("User already existed")
                return done(null, user)
            }
        })
    }
))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
