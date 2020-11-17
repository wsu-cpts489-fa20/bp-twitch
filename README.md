# bp-twitch

**bp-twitch** is a desktop Twitch chat client based on the MERN stack architecture.
It allows users to chat in twitch channel's via the TMI.js api. 

## Development Commands

### Root Directory

`npm run edev` : Start server and electron app. Client must have build generated. 

`npm run build`: Compile server.js into server.compiled.js

`npm run ebuild`: Generate production build into `dist/` directory.

`testcafe chrome ./test/tests.js`: Run this command in the root directory to run tests. You must run `npm run edev` first in its own shell. You must also generate a twitch oauth token. Get your token by inspecting the websocket traffic or by expanding the object that is automatically printed to the console when enter is pressed in the channel search box. All the online oauth token generators I found don't request permission to chat, so they won't work. Your token will start with `oauth:`. You must put this in `localUserObj` at the top of views/TwitchChatClient.jsx

```
{
    login: 'your_twitch_login',
    token: 'oauth:your_oauth_token'
}
```

You need this file because twitch requires 2fa to use the web login

### Client Directory

`npm run build`: Generate a build of the client. 