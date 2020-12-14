"use strict";

var _passport = _interopRequireDefault(require("passport"));

var _passportTwitchNew = _interopRequireDefault(require("passport-twitch-new"));

var _expressSession = _interopRequireDefault(require("express-session"));

var _regeneratorRuntime = _interopRequireDefault(require("regenerator-runtime"));

var _path = _interopRequireDefault(require("path"));

var _express = _interopRequireDefault(require("express"));

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _twitchAuth = require("twitch-auth");

var _dotenv = _interopRequireDefault(require("dotenv"));

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

_dotenv["default"].config();

var LOCAL_PORT = 8081;
var DEPLOY_URL = process.env.NODE_ENV === "production" ? "" : "http://localhost:8081";
var CALLBACK_URL = DEPLOY_URL + "/auth/twitch/callback";
var PORT = process.env.HTTP_PORT || LOCAL_PORT;
var TwitchStrategy = _passportTwitchNew["default"].Strategy;
var CLIENT_ID = "19fbkc20uggbz1a7bcka2azyr2clsu";
var CLIENT_SECRET = "4m1ss0l88dgxw2oxh1mr0bi91hb3o6";
var authProvider = new _twitchAuth.ClientCredentialsAuthProvider(CLIENT_ID, CLIENT_SECRET);
var app = (0, _express["default"])();
var token = ""; //////////////////////////////////////////////////////////////////////////
//MONGOOSE SET-UP
//The following code sets up the app to connect to a MongoDB database
//using the mongoose library.
//////////////////////////////////////////////////////////////////////////

var connectStr = "mongodb+srv://dbAdmin:ZBreTCg72R6acylV@ia7-radewyatt.vcp1c.mongodb.net/appdb?retryWrites=true&w=majority";

_mongoose["default"].connect(connectStr, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(function () {
  console.log("Connected to ".concat(connectStr, "."));
}, function (err) {
  console.error("Error connecting to ".concat(connectStr, ": ").concat(err));
});

var Schema = _mongoose["default"].Schema;
var roundSchema = new Schema({
  date: {
    type: Date,
    required: true
  },
  course: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    "enum": ['practice', 'tournament']
  },
  holes: {
    type: Number,
    required: true,
    min: 1,
    max: 18
  },
  strokes: {
    type: Number,
    required: true,
    min: 1,
    max: 300
  },
  minutes: {
    type: Number,
    required: true,
    min: 1,
    max: 240
  },
  seconds: {
    type: Number,
    required: true,
    min: 0,
    max: 60
  },
  notes: {
    type: String,
    required: true
  }
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});
roundSchema.virtual('SGS').get(function () {
  return this.strokes * 60 + this.minutes * 60 + this.seconds;
}); //Define schema that maps to a document in the Users collection in the appdb
//database.

var userSchema = new Schema({
  id: String,
  //unique identifier for user
  password: String,
  displayName: String,
  //Name to be displayed within app
  authStrategy: String,
  //strategy used to authenticate, e.g., twitch
  profilePicURL: String,
  //link to profile image
  securityQuestion: String,
  securityAnswer: {
    type: String,
    required: function required() {
      return this.securityQuestion ? true : false;
    }
  },
  rounds: [roundSchema]
});

var User = _mongoose["default"].model("User", userSchema); //////////////////////////////////////////////////////////////////////////
//PASSPORT SET-UP
//The following code sets up the app with OAuth authentication using
//the 'twitch' strategy in passport.js.
//////////////////////////////////////////////////////////////////////////


_passport["default"].use(new TwitchStrategy({
  clientID: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  callbackURL: CALLBACK_URL,
  scope: ["user_read", "chat:edit", "chat:read"]
},
/*#__PURE__*/
//The following function is called after user authenticates with twitch
function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime["default"].mark(function _callee(accessToken, refreshToken, profile, done) {
    return _regeneratorRuntime["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            token = accessToken;
            console.log("User authenticated through Twitch! In passport callback.");
            return _context.abrupt("return", done(null, profile));

          case 3:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
}())); //Serialize the current user to the session


_passport["default"].serializeUser(function (user, done) {
  console.log("In serializeUser.");
  console.log("Contents of user param: " + JSON.stringify(user));
  done(null, user);
}); //Deserialize the current user from the session
//to persistent storage.


_passport["default"].deserializeUser(function (user, done) {
  done(null, user);
}); //////////////////////////////////////////////////////////////////////////
//INITIALIZE EXPRESS APP
// The following code uses express.static to serve the React app defined 
//in the client/ directory at PORT. It also writes an express session
//to a cookie, and initializes a passport object to support OAuth.
/////////////////////////////////////////////////////////////////////////


app.use((0, _expressSession["default"])({
  secret: "tcgod",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60
  }
})).use(_express["default"]["static"](_path["default"].join(__dirname, "client/build"))).use(_passport["default"].initialize()).use(_passport["default"].session()).use(_express["default"].json({
  limit: '20mb'
})).listen(PORT, function () {
  return console.log("Listening on ".concat(PORT));
}); //////////////////////////////////////////////////////////////////////////
//DEFINE EXPRESS APP ROUTES
//////////////////////////////////////////////////////////////////////////
/////////////////////////
//AUTHENTICATION ROUTES
/////////////////////////
//AUTHENTICATE route: Uses passport to authenticate with Twitch.
//Should be accessed when user clicks on 'Login with Twitch' button on 
//Log In page.

app.get('/auth/twitch', _passport["default"].authenticate('twitch')); //CALLBACK route:  Twitch will call this route after the
//OAuth authentication process is complete.
//req.isAuthenticated() tells us whether authentication was successful.

app.get('/auth/twitch/callback', _passport["default"].authenticate('twitch', {
  failureRedirect: '/'
}), function (req, res) {
  console.log("auth/twitch/callback reached.");
  res.redirect("/"); //sends user back to login screen; 
  //req.isAuthenticated() indicates status
}); //LOGOUT route: Use passport's req.logout() method to log the user out and
//redirect the user to the main app page. req.isAuthenticated() is toggled to false.

app.get('/auth/logout', function (req, res) {
  console.log('/auth/logout reached. Logging out');
  req.logout();
  res.redirect('/');
}); //TEST route: Tests whether user was successfully authenticated.
//Should be called from the React.js client to set up app state.

app.get('/auth/test', function (req, res) {
  console.log("auth/test reached.");
  var isAuth = req.isAuthenticated();

  if (isAuth) {
    console.log("User is authenticated");
    console.log("User record tied to session: " + JSON.stringify(req.user));
    req.user.token = token;
  } else {
    //User is not authenticated
    console.log("User is not authenticated");
  } //Return JSON object to client with results.


  res.json({
    isAuthenticated: isAuth,
    user: req.user
  });
}); // ANONYMOUS route: Retrieves an access token for when user is in
// anonymous mode. This is technically an app token and should
// follor the guidelines for use as such.

app.get('/auth/anonymous', /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime["default"].mark(function _callee2(req, res) {
    var result;
    return _regeneratorRuntime["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            console.log('Creating anonymous access token');
            _context2.next = 3;
            return authProvider.getAccessToken();

          case 3:
            result = _context2.sent;
            console.log("Access Token: ", result);
            res.json({
              accessToken: result.accessToken
            });

          case 6:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}()); // SEARCH route: Queries the Twitch API endpoint for searching 
// channels. Requires an access token and search value as query
// params.

app.get('/search/channels', function (req, res) {
  var reqAccessToken = req.query.accessToken;
  var reqSearchValue = req.query.searchValue;
  var reqLiveOnly = req.query.liveOnly;
  var requestUrl = "https://api.twitch.tv/helix/search/channels?query=".concat(reqSearchValue, "&live_only=").concat(reqLiveOnly);
  console.log('Request URL: ', requestUrl);
  console.log('Request Access Token: ', reqAccessToken);
  console.log('Request Search Value: ', reqSearchValue);
  (0, _nodeFetch["default"])(requestUrl, {
    method: 'GET',
    headers: {
      'Authorization': "Bearer ".concat(reqAccessToken),
      'Client-Id': CLIENT_ID
    }
  }).then(function (reqResponse) {
    return reqResponse.json();
  }).then(function (reqResponse) {
    return res.json({
      data: reqResponse.data
    });
  });
});
module.exports = app;
