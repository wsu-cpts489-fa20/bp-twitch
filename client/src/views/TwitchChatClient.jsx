import React from 'react';
import TMI from 'tmi.js';
import { withStyles } from '@material-ui/styles';
import ChatStream from "../components/ChatStream";
import StreamSelect from "../components/StreamSelect";
import ElectronBar from "../components/ElectronBar";
import LoginPage from "../components/LoginPage";

const styles = {
    appcontainer: {
        width: "100%",
        height: "100%",
        backgroundColor: "#121212",
        display: "grid",
        'grid-template-rows': '24px .1fr 1fr',
    },
};

class TwitchChatClient extends React.Component {
    constructor() {
        super();
        this.state = {
            userId: null,
            client: null,
            isAuthenticated: false
        }
    }

    componentDidMount() {
        if (!this.state.authenticated) {
            //Use /auth/test route to (re)-test authentication and obtain user data
            fetch("/auth/test")
                .then((response) => response.json())
                .then((obj) => {
                    if (obj.isAuthenticated) {
                        const userId = obj.user.id;

                        //Update current user
                        this.setState({
                            userId: userId,
                            isAuthenticated: true
                        });
                    }
                })
        }
    }

    changeChannel = (newChannel) => {
        const { client } = this.state;
        if (client)
            client.disconnect();
        const newClient = new TMI.Client({
            connection: {
                reconnect: true,
                secure: true
            },
            channels: [newChannel]
        });
        this.setState({ client: newClient });
    }

    render() {
        const { client } = this.state;
        const { classes } = this.props;
        return (
            <div className={classes.appcontainer}>
                <ElectronBar />
                { this.state.isAuthenticated ? <>
                    <StreamSelect changeChannel={this.changeChannel} />
                    <ChatStream client={client} /></>
                    : <LoginPage />
                }
            </div>
        );
    }
}

export default withStyles(styles)(TwitchChatClient);