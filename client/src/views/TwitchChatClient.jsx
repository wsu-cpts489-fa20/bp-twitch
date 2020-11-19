import React from "react";
import TMI from "tmi.js";
import { withStyles } from "@material-ui/styles";
import ChatStream from "../components/ChatStream";
import StreamSelect from "../components/StreamSelect";
import ElectronBar from "../components/ElectronBar";
import LoginPage from "../components/LoginPage";
import ChatTextBox from "../components/ChatTextBox"
// get your token by inspecting the websocket traffic or by expanding the object that is automatically printed to the console when enter is pressed in the channel search box
// all the online oauth token generators don't request permission to chat so they don't work
const localUserObj = {
    login: 'your_login_name',
    token: 'oauth:your_oauth_token'
}

const styles = {
  appcontainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#121212",
    display: "grid",
    "grid-template-rows": "24px .1fr 1fr",
  },
};

class TwitchChatClient extends React.Component {
    constructor() {
        super();
        this.state = {
            userObj: null,
            client: null,
            channel: null,
            isAuthenticated: false,
            isAnonymous: false,
        };
    }

    componentDidMount() {
        const { isAuthenticated } = this.state;
        if (!isAuthenticated) {
            fetch("/auth/test")
                .then((response) => response.json())
                .then((obj) => {
                    if (obj.isAuthenticated) {
                        this.setState({
                            userObj: obj.user,
                            isAuthenticated: true,
                        });
                    }
                });
        }
    }

    setAnonMode = () => {
        this.setState({ isAnonymous: true });
    }

    setTestMode = () => {
        localUserObj.token = localUserObj.token.split(":")[1]
        this.setState({ userObj: localUserObj, isAuthenticated: true });
    }

    changeChannel = (newChannel) => {
        this.setState({ channel: newChannel })
        const { client } = this.state;
        if (client) client.disconnect();
        var newClient;
        if (this.state.isAnonymous) {
            newClient = new TMI.Client({
                connection: {
                    reconnect: true,
                    secure: true,
                },
                channels: [newChannel],
            });
        } else {
            var password = 'oauth:' + this.state.userObj.token;
            newClient = new TMI.Client({
                connection: {
                    reconnect: true,
                    secure: true,
                },
                identity: {
                    username: this.state.userObj.login,
                    "password": password
                },
                channels: [newChannel],
            });
        }
        this.setState({ client: newClient });
    };

    render() {
        const { client, isAuthenticated, isAnonymous } = this.state;
        const { classes } = this.props;
        return (
            <div className={classes.appcontainer}>
                <ElectronBar />
                {!isAuthenticated && !isAnonymous ? (
                    <LoginPage setTestMode={this.setTestMode} setAnonMode={this.setAnonMode} />
                ) : (
                        <>
                            <StreamSelect changeChannel={this.changeChannel} />
                            <ChatStream client={client} />
                            { this.state.isAuthenticated && this.state.client != null ? <ChatTextBox channel={ this.state.channel } client={this.state.client} userObj={this.state.userObj} /> : null}
                        </>
                    )}
            </div>
        );
    }
}

export default withStyles(styles)(TwitchChatClient);
