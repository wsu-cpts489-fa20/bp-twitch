//////////////////////////////////////////////////////////////////////////
//IMPORTS AND VARIABLE INITIALIZATIONS
//The following code imports necessary dependencies and initializes
//variables used in the server middleware.
//////////////////////////////////////////////////////////////////////////
import passport from 'passport';
import passportTwitch from 'passport-twitch-new';
import session from 'express-session';
import regeneratorRuntime from "regenerator-runtime";
import path from 'path';
import express from 'express';
import fetch from 'node-fetch';
import { ClientCredentialsAuthProvider } from 'twitch-auth';
require('dotenv').config();

const LOCAL_PORT = 8081;
const DEPLOY_URL = process.env.NODE_ENV === "production" ? "" : "http://localhost:8081";
const CALLBACK_URL = DEPLOY_URL + "/auth/twitch/callback";
const PORT = process.env.HTTP_PORT || LOCAL_PORT;

const TwitchStrategy = passportTwitch.Strategy;
const CLIENT_ID = "19fbkc20uggbz1a7bcka2azyr2clsu";
const CLIENT_SECRET = "4m1ss0l88dgxw2oxh1mr0bi91hb3o6";
const authProvider = new ClientCredentialsAuthProvider(CLIENT_ID, CLIENT_SECRET);

const app = express();
var token = ""

//////////////////////////////////////////////////////////////////////////
//MONGOOSE SET-UP
//The following code sets up the app to connect to a MongoDB database
//using the mongoose library.
//////////////////////////////////////////////////////////////////////////
import mongoose from 'mongoose';

const connectStr = "mongodb+srv://dbAdmin:ZBreTCg72R6acylV@ia7-radewyatt.vcp1c.mongodb.net/appdb?retryWrites=true&w=majority";
mongoose.connect(connectStr, {useNewUrlParser: true, useUnifiedTopology: true})
  .then(
    () =>  {console.log(`Connected to ${connectStr}.`)},
    err => {console.error(`Error connecting to ${connectStr}: ${err}`)}
  );

const Schema = mongoose.Schema;
const roundSchema = new Schema({
  date: {type: Date, required: true},
  course: {type: String, required: true},
  type: {type: String, required: true, enum: ['practice','tournament']},
  holes: {type: Number, required: true, min: 1, max: 18},
  strokes: {type: Number, required: true, min: 1, max: 300},
  minutes: {type: Number, required: true, min: 1, max: 240},
  seconds: {type: Number, required: true, min: 0, max: 60},
  notes: {type: String, required: true}
},
{
  toObject: {
  virtuals: true
  },
  toJSON: {
  virtuals: true 
  }
});

roundSchema.virtual('SGS').get(function() {
  return (this.strokes * 60) + (this.minutes * 60) + this.seconds;
});

//Define schema that maps to a document in the Users collection in the appdb
//database.
const userSchema = new Schema({
  id: String, //unique identifier for user
  password: String,
  displayName: String, //Name to be displayed within app
  authStrategy: String, //strategy used to authenticate, e.g., twitch
  profilePicURL: String, //link to profile image
  securityQuestion: String,
  securityAnswer: {type: String, required: function() 
    {return this.securityQuestion ? true: false}},
  rounds: [roundSchema]
});
const User = mongoose.model("User",userSchema); 

//////////////////////////////////////////////////////////////////////////
//PASSPORT SET-UP
//The following code sets up the app with OAuth authentication using
//the 'twitch' strategy in passport.js.
//////////////////////////////////////////////////////////////////////////
passport.use(new TwitchStrategy({
  clientID: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  callbackURL: CALLBACK_URL,
  scope: ["user_read", "chat:edit", "chat:read"]
},
//The following function is called after user authenticates with twitch
async (accessToken, refreshToken, profile, done) => {
    token = accessToken;
    console.log("User authenticated through Twitch! In passport callback.");
    return done(null, profile);
}));

//Serialize the current user to the session
passport.serializeUser((user, done) => {
    console.log("In serializeUser.");
    console.log("Contents of user param: " + JSON.stringify(user));
    done(null, user);
});
  
//Deserialize the current user from the session
//to persistent storage.
passport.deserializeUser(function (user, done) {
    done(null, user);
});

//////////////////////////////////////////////////////////////////////////
//INITIALIZE EXPRESS APP
// The following code uses express.static to serve the React app defined 
//in the client/ directory at PORT. It also writes an express session
//to a cookie, and initializes a passport object to support OAuth.
/////////////////////////////////////////////////////////////////////////

app
  .use(session({secret: "tcgod", 
                resave: false,
                saveUninitialized: false,
                cookie: {maxAge: 1000 * 60}}))
  .use(express.static(path.join(__dirname,"client/build")))
  .use(passport.initialize())
  .use(passport.session())
  .use(express.json({limit: '20mb'}))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

//////////////////////////////////////////////////////////////////////////
//DEFINE EXPRESS APP ROUTES
//////////////////////////////////////////////////////////////////////////

/////////////////////////
//AUTHENTICATION ROUTES
/////////////////////////

//AUTHENTICATE route: Uses passport to authenticate with Twitch.
//Should be accessed when user clicks on 'Login with Twitch' button on 
//Log In page.
app.get('/auth/twitch', passport.authenticate('twitch'));

//CALLBACK route:  Twitch will call this route after the
//OAuth authentication process is complete.
//req.isAuthenticated() tells us whether authentication was successful.
app.get('/auth/twitch/callback', passport.authenticate('twitch', { failureRedirect: '/' }),
  (req, res) => {
    console.log("auth/twitch/callback reached.")
    res.redirect("/"); //sends user back to login screen; 
    //req.isAuthenticated() indicates status
  }
);

//LOGOUT route: Use passport's req.logout() method to log the user out and
//redirect the user to the main app page. req.isAuthenticated() is toggled to false.
app.get('/auth/logout', (req, res) => {
    console.log('/auth/logout reached. Logging out');
    req.logout();
    res.redirect('/');
});

//TEST route: Tests whether user was successfully authenticated.
//Should be called from the React.js client to set up app state.
app.get('/auth/test', (req, res) => {
    console.log("auth/test reached.");
    const isAuth = req.isAuthenticated();
    if (isAuth) {
        console.log("User is authenticated");
        console.log("User record tied to session: " + JSON.stringify(req.user));
        req.user.token = token
    } else {
        //User is not authenticated
        console.log("User is not authenticated");
    }
    //Return JSON object to client with results.
    res.json({isAuthenticated: isAuth, user: req.user});
});

app.get('/auth/anonymous', async(req, res) => {
  console.log('Creating anonymous access token');
  const result = await authProvider.getAccessToken();
  console.log("Access Token: ", result);
  res.json({ accessToken: result.accessToken });
});

app.get('/search/channels', async (req, res) => {
  const reqAccessToken = req.query.accessToken;
  const reqSearchValue = req.query.searchValue;
  const requestUrl = `https://api.twitch.tv/helix/search/channels?query=${reqSearchValue}`;
  console.log('Request URL: ', requestUrl);
  console.log('Request Access Token: ', reqAccessToken);
  console.log('Request Search Value: ', reqSearchValue);
  const reqResponse = await fetch(requestUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${reqAccessToken}`,
      'Client-Id': CLIENT_ID
    }
  })
    .then(reqResponse => reqResponse.json())
    .then(reqResponse => console.log(reqResponse));
  res.json(reqResponse);
});

module.exports = app;