import React from "react";
import TMI from "tmi.js";
import { withStyles } from "@material-ui/styles";
import ChatStream from "../components/ChatStream";
import StreamSelect from "../components/StreamSelect";
import ElectronBar from "../components/ElectronBar";
import LoginPage from "../components/LoginPage";
import ChatTextBox from "../components/ChatTextBox";
import { ThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
const { remote } = window.require('electron');

const tcUsr = remote.getGlobal('commandLineArgs').username;
const tcToken = remote.getGlobal('commandLineArgs').token;

const styles = {
  appcontainer: {
    width: "100%",
    height: "100%",
    display: "grid",
    "grid-template-rows": "24px .1fr 1fr",
  },
};

class TwitchChatClient extends React.PureComponent {
    constructor() {
        super();
        this.state = {
            userObj: null,
            client: null,
            channel: null,
            isAuthenticated: false,
            isAnonymous: false,
            theme: "light"
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
                        });
                    }
                });
        }
    }

    setAnonMode = () => {
        this.setState({ isAnonymous: true });
    }

    toggleTheme = () => {
        const { theme } = this.state;
        if (theme === "light")
            this.setState({theme: "dark"})
        else 
            this.setState({theme: "light"})
    }

    // create new twitch client based on input string which holds channel name
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
            return <LoginPage setAnonMode={this.setAnonMode} />
        } else {
            return (
                <>
                    <StreamSelect changeChannel={this.changeChannel} />
                    <ChatStream client={client} />
                    <ChatTextBox channel={channel} isAnon={isAnonymous} client={client} userObj={userObj} />
                </>
            )
        }
    }

    render() {
        const { classes } = this.props;
        const { userObj, theme } = this.state;
        const muitheme = createMuiTheme({
            palette: {
              type: theme,
            },
          });
        return (
            <ThemeProvider theme={muitheme}>
                <CssBaseline />
                <div className={classes.appcontainer} data-testid="app-container">
                    <ElectronBar user={userObj} toggleTheme={this.toggleTheme} theme={theme} />
                    {this.getAppBody()}
                </div>
            </ThemeProvider>
        );
    }
}

export default withStyles(styles)(TwitchChatClient);
