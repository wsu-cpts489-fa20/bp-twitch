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
require('dotenv').config();

const LOCAL_PORT = 8081;
const DEPLOY_URL = process.env.NODE_ENV === "production" ? "" : "http://localhost:8081";
const PORT = process.env.HTTP_PORT || LOCAL_PORT;
const TwitchStrategy = passportTwitch.Strategy;
const app = express();

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
  clientID: "19fbkc20uggbz1a7bcka2azyr2clsu",
  clientSecret: "4m1ss0l88dgxw2oxh1mr0bi91hb3o6",
  callbackURL: DEPLOY_URL + "/auth/twitch/callback",
  scope: "user_read"
},
//The following function is called after user authenticates with twitch
async (accessToken, refreshToken, profile, done) => {
  console.log("User authenticated through Twitch! In passport callback.");
  //Our convention is to build userId from displayName and provider
  console.log(profile);

  const userId = profile.id;
  return done(null,userId);
}));

//Serialize the current user to the session
passport.serializeUser((user, done) => {
    console.log("In serializeUser.");
    console.log("Contents of user param: " + JSON.stringify(user));
    done(null, user);
});
  
//Deserialize the current user from the session
//to persistent storage.
passport.deserializeUser(function(user, done) {
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
    } else {
        //User is not authenticated
        console.log("User is not authenticated");
    }
    //Return JSON object to client with results.
    res.json({isAuthenticated: isAuth, user: req.user});
});

//LOGIN route: Attempts to log in user using local strategy
app.post('/auth/login', 
  passport.authenticate('local', { failWithError: true }),
  (req, res) => {
    console.log("/login route reached: successful authentication.");
    //Redirect to app's main page; the /auth/test route should return true
    res.status(200).send("Login successful");
  },
  (err, req, res, next) => {
    console.log("/login route reached: unsuccessful authentication");
    if (req.authError) {
      console.log("req.authError: " + req.authError);
      res.status(401).send(req.authError);
    } else {
      res.status(401).send("Unexpected error occurred when attempting to authenticate. Please try again.");
    }
    //Note: Do NOT redirect! Client will take over.
  });

/////////////////////////////////
//USER ACCOUNT MANAGEMENT ROUTES
////////////////////////////////


//READ user route: Retrieves the user with the specified userId from users collection (GET)
app.get('/users/:userId', async(req, res, next) => {
  console.log("in /users route (GET) with userId = " + 
    JSON.stringify(req.params.userId));
  try {
    let thisUser = await User.findOne({id: req.params.userId});
    if (!thisUser) {
      return res.status(404).send("No user account with id " +
        req.params.userId + " was found in database.");
    } else {
      return res.status(200).json(JSON.stringify(thisUser));
    }
  } catch (err) {
    console.log()
    return res.status(400).send("Unexpected error occurred when looking up user with id " +
      req.params.userId + " in database: " + err);
  }
});

//CREATE user route: Adds a new user account to the users collection (POST)
app.post('/users/:userId',  async (req, res, next) => {
  console.log("in /users route (POST) with params = " + JSON.stringify(req.params) +
    " and body = " + JSON.stringify(req.body));  
  if (req.body === undefined ||
      !req.body.hasOwnProperty("password") || 
      !req.body.hasOwnProperty("displayName") ||
      !req.body.hasOwnProperty("profilePicURL") ||
      !req.body.hasOwnProperty("securityQuestion") ||
      !req.body.hasOwnProperty("securityAnswer")) {
    //Body does not contain correct properties
    return res.status(400).send("/users POST request formulated incorrectly. " + 
      "It must contain 'password','displayName','profilePicURL','securityQuestion' and 'securityAnswer fields in message body.")
  }
  try {
    let thisUser = await User.findOne({id: req.params.userId});
    if (thisUser) { //account already exists
      res.status(400).send("There is already an account with email '" + 
        req.params.userId + "'.");
    } else { //account available -- add to database
      thisUser = await new User({
        id: req.params.userId,
        password: req.body.password,
        displayName: req.body.displayName,
        authStrategy: 'local',
        profilePicURL: req.body.profilePicURL,
        securityQuestion: req.body.securityQuestion,
        securityAnswer: req.body.securityAnswer,
        rounds: []
      }).save();
      return res.status(201).send("New account for '" + 
        req.params.userId + "' successfully created.");
    }
  } catch (err) {
    return res.status(400).send("Unexpected error occurred when adding or looking up user in database. " + err);
  }
});

//UPDATE user route: Updates a new user account in the users collection (POST)
app.put('/users/:userId',  async (req, res, next) => {
  console.log("in /users update route (PUT) with userId = " + JSON.stringify(req.params) + 
    " and body = " + JSON.stringify(req.body));
  if (!req.params.hasOwnProperty("userId"))  {
    return res.status(400).send("users/ PUT request formulated incorrectly." +
        "It must contain 'userId' as parameter.");
  }
  const validProps = ['password', 'displayName', 'profilePicURL', 
    'securityQuestion', 'securityAnswer'];
  for (const bodyProp in req.body) {
    if (!validProps.includes(bodyProp)) {
      return res.status(400).send("users/ PUT request formulated incorrectly." +
        "Only the following props are allowed in body: " +
        "'password', 'displayname', 'profilePicURL', 'securityQuestion', 'securityAnswer'");
    } 
  }
  try {
        let status = await User.updateOne({id: req.params.userId}, 
          {$set: req.body});
        if (status.nModified != 1) { //account could not be found
          res.status(404).send("No user account " + req.params.userId + " exists. Account could not be updated.");
        } else {
          res.status(200).send("User account " + req.params.userId + " successfully updated.")
        }
      } catch (err) {
        res.status(400).send("Unexpected error occurred when updating user data in database: " + err);
      }
});

//DELETE user route: Deletes the document with the specified userId from users collection (DELETE)
app.delete('/users/:userId', async(req, res, next) => {
  console.log("in /users route (DELETE) with userId = " + 
    JSON.stringify(req.params.userId));
  try {
    let status = await User.deleteOne({id: req.params.userId});
    if (status.deletedCount != 1) {
      return res.status(404).send("No user account " +
        req.params.userId + " was found. Account could not be deleted.");
    } else {
      return res.status(200).send("User account " +
      req.params.userId + " was successfully deleted.");
    }
  } catch (err) {
    console.log()
    return res.status(400).send("Unexpected error occurred when attempting to delete user account with id " +
      req.params.userId + ": " + err);
  }
});

/////////////////////////////////
//ROUNDS ROUTES
////////////////////////////////

//CREATE round route: Adds a new round as a subdocument to 
//a document in the users collection (POST)
app.post('/rounds/:userId', async (req, res, next) => {
  console.log("in /rounds (POST) route with params = " + 
              JSON.stringify(req.params) + " and body = " + 
              JSON.stringify(req.body));
  if (!req.body.hasOwnProperty("date") || 
      !req.body.hasOwnProperty("course") || 
      !req.body.hasOwnProperty("type") ||
      !req.body.hasOwnProperty("holes") || 
      !req.body.hasOwnProperty("strokes") ||
      !req.body.hasOwnProperty("minutes") ||
      !req.body.hasOwnProperty("seconds") || 
      !req.body.hasOwnProperty("notes")) {
    //Body does not contain correct properties
    return res.status(400).send("POST request on /rounds formulated incorrectly." +
      "Body must contain all 8 required fields: date, course, type, holes, strokes, "       +  "minutes, seconds, notes.");
  }
  try {
    let status = await User.updateOne(
    {id: req.params.userId},
    {$push: {rounds: req.body}});
    if (status.nModified != 1) { //Should never happen!
      res.status(400).send("Unexpected error occurred when adding round to"+
        " database. Round was not added.");
    } else {
      res.status(200).send("Round successfully added to database.");
    }
  } catch (err) {
    console.log(err);
    return res.status(400).send("Unexpected error occurred when adding round" +
     " to database: " + err);
  } 
});

//READ round route: Returns all rounds associated 
//with a given user in the users collection (GET)
app.get('/rounds/:userId', async(req, res) => {
  console.log("in /rounds route (GET) with userId = " + 
    JSON.stringify(req.params.userId));
  try {
    let thisUser = await User.findOne({id: req.params.userId});
    if (!thisUser) {
      return res.status(400).message("No user account with specified userId was found in database.");
    } else {
      return res.status(200).json(JSON.stringify(thisUser.rounds));
    }
  } catch (err) {
    console.log()
    return res.status(400).message("Unexpected error occurred when looking up user in database: " + err);
  }
});

//UPDATE round route: Updates a specific round 
//for a given user in the users collection (PUT)
app.put('/rounds/:userId/:roundId', async (req, res, next) => {
  console.log("in /rounds (PUT) route with params = " + 
              JSON.stringify(req.params) + " and body = " + 
              JSON.stringify(req.body));
  const validProps = ['date', 'course', 'type', 'holes', 'strokes',
    'minutes', 'seconds', 'notes'];
  let bodyObj = {...req.body};
  delete bodyObj._id; //Not needed for update
  delete bodyObj.SGS; //We'll compute this below in seconds.
  for (const bodyProp in bodyObj) {
    if (!validProps.includes(bodyProp)) {
      return res.status(400).send("rounds/ PUT request formulated incorrectly." +
        "It includes " + bodyProp + ". However, only the following props are allowed: " +
        "'date', 'course', 'type', 'holes', 'strokes', " +
        "'minutes', 'seconds', 'notes'");
    } else {
      bodyObj["rounds.$." + bodyProp] = bodyObj[bodyProp];
      delete bodyObj[bodyProp];
    }
  }
  try {
    let status = await User.updateOne(
      {"id": req.params.userId,
       "rounds._id": mongoose.Types.ObjectId(req.params.roundId)}
      ,{"$set" : bodyObj}
    );
    if (status.nModified != 1) {
      res.status(400).send("Unexpected error occurred when updating round in database. Round was not updated.");
    } else {
      res.status(200).send("Round successfully updated in database.");
    }
  } catch (err) {
    console.log(err);
    return res.status(400).send("Unexpected error occurred when updating round in database: " + err);
  } 
});

//DELETE round route: Deletes a specific round 
//for a given user in the users collection (DELETE)
app.delete('/rounds/:userId/:roundId', async (req, res, next) => {
  console.log("in /rounds (DELETE) route with params = " + 
              JSON.stringify(req.params)); 
  try {
    let status = await User.updateOne(
      {id: req.params.userId},
      {$pull: {rounds: {_id: mongoose.Types.ObjectId(req.params.roundId)}}});
    if (status.nModified != 1) { //Should never happen!
      res.status(400).send("Unexpected error occurred when deleting round from database. Round was not deleted.");
    } else {
      res.status(200).send("Round successfully deleted from database.");
    }
  } catch (err) {
    console.log(err);
    return res.status(400).send("Unexpected error occurred when deleting round from database: " + err);
  } 
});

module.exports = app;