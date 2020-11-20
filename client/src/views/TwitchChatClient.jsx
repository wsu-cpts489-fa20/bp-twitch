import React from "react";
import TMI from "tmi.js";
import { withStyles } from "@material-ui/styles";
import ChatStream from "../components/ChatStream";
import StreamSelect from "../components/StreamSelect";
import ElectronBar from "../components/ElectronBar";
import LoginPage from "../components/LoginPage";
import ChatTextBox from "../components/ChatTextBox"
const { remote } = window.require('electron');

const tcUsr = remote.getGlobal('commandLineArgs').username;
const tcToken = remote.getGlobal('commandLineArgs').token;

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
            accessToken: ""
        };
    }

    componentDidMount() {
        const { isAuthenticated } = this.state;
        // if we are in test mode.
        if (tcUsr && tcToken) {
            const testObj = {login: tcUsr, token: tcToken.split(":")[1]}
            this.setState({userObj: testObj, isAuthenticated: true})
        } 
        if (!isAuthenticated) {
            fetch("/auth/test")
                .then((response) => response.json())
                .then((obj) => {
                    if (obj.isAuthenticated) {
                        this.setState({
                            userObj: obj.user,
                            isAuthenticated: true,
                            accessToken: obj.user.token
                        });
                    }
                });
        }
    }

    setAnonMode = () => {
        fetch("/auth/anonymous")
            .then(response => response.json())
            .then(obj => {
                this.setState({
                    isAnon: true,
                    accessToken: obj.accessToken
                });
            });
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
                    password: password
                },
                channels: [newChannel],
            });
        }
        this.setState({ client: newClient });
    };

    getAppBody = () => {
        const { client, channel, userObj, isAuthenticated, isAnonymous } = this.state;
        if (!isAuthenticated && !isAnonymous) {
            return <LoginPage setTestMode={this.setTestMode} setAnonMode={this.setAnonMode} />
        } else {
            return (
                <>
                    <StreamSelect changeChannel={this.changeChannel} accessToken={this.state.accessToken} />
                    <ChatStream client={client} />
                    <ChatTextBox channel={channel} isAnon={isAnonymous} client={client} userObj={userObj} />
                </>
            )
        }
    }

    render() {
        const { classes } = this.props;
        return (
            <div className={classes.appcontainer}>
                <ElectronBar />
                {this.getAppBody()}
            </div>
        );
    }
}

export default withStyles(styles)(TwitchChatClient);
