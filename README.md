# bp-twitch

**bp-twitch** is a desktop Twitch chat client based on the MERN stack architecture.
It allows users to chat in twitch channel's via the TMI.js api. 

## Development Commands

### Root Directory

`npm start` : Start server and electron app. Client must have build generated. 

`npm run build`: Compile server.js into server.compiled.js

`npm run ebuild`: Generate production build into `dist/` directory.

`npm test`: Run this command in the root directory to run tests. Client must have build generated. In `.testcafe-electron-rc.json`, replace 
            the arguments listed below with your specific twitch account's name and oauth token. The oauth token can be found via the network 
            tab within the developer tools after connecting to a twitch channel. Remember, oauth tokens expire so if this command is failing generate a new one. 

```

"appArgs": ["electron", ".", "<your-twitch-username>", "oauth:<your-twitch-oauth-token>"]

```

### Client Directory

`npm run build`: Generate a build of the client. 