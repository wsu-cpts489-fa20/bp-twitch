import React from 'react';
import TMI from 'tmi.js';
import { withStyles } from '@material-ui/styles';
import ChatStream from "../components/ChatStream";
import StreamSelect from "../components/StreamSelect";
import ElectronBar from "../components/ElectronBar";

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
            client: null,
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
            channels: [ newChannel ]
        });
        this.setState({client: newClient});
    }

    render() {
        const { client } = this.state;
        const { classes } = this.props;
        return (
            <div className={classes.appcontainer}>
                <ElectronBar />
                <StreamSelect changeChannel={this.changeChannel}/>
                <ChatStream client={client}/>
            </div>
        );
    }
}

export default withStyles(styles)(TwitchChatClient);