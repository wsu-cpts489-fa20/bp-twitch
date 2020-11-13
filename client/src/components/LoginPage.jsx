import React from 'react';

class LoginPage extends React.Component {
    handleTwitchOauthLogin = () => {
        window.open('/auth/twitch', "_self");
    }

    render() {
        return <button onClick={this.handleTwitchOauthLogin}>Login With Twitch</button>
    }
}

export default LoginPage;