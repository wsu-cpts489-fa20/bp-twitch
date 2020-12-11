import React from 'react';
import { withStyles } from '@material-ui/styles';
import uuid from 'react-uuid';
import ChatTile from "./ChatTile";
import UserDetail from "./UserDetail";
import ScrollableFeed from 'react-scrollable-feed'

const styles = {
    streamContainer: {
        overflow: "scroll",
        "&::-webkit-scrollbar": {
            display: "none"
        }
    }
}

class ChatStream extends React.Component {
    constructor(props) {
        super();
        this.state = {
            chats: [],
            channel: null,
            user: null,
        }

        this.messagesEndRef = React.createRef();
        this.setDetailUser = this.setDetailUser.bind(this);
    }

    componentDidUpdate(prevProps) {
        const { client } = this.props;
        // if we detect a new twitch client, generate websocket listener and update chat state
        if (!prevProps.client && client || (prevProps.client && client && client.channels[0] !== prevProps.client.channels[0])) {
            this.updateTwitchClient();
            this.setState({chats: []});
        }
    }

    updateTwitchClient() {
        const { client } = this.props;
        // connect to the new twitch client
        client.connect();
        // on a new message, add it to our local state.
        client.on('message', (channel, user, message, self) => {
            // only keep 200 chats in memory at a time.
            if (this.state.chats.length === 200)
                this.state.chats.shift();
            this.state.chats.push([user, message])
            this.setState({chats: this.state.chats});
            // auto scroll to bottom for the first 20 chat messages
            if (this.state.chats.length <= 20)
                this.scrollToBottom()
        });
    }

    setDetailUser = (newUser) => {
        this.setState({"user": newUser});
    }

    renderUserDetail = () => {
        if(this.state.user === null) {
            return;
        }
        else {
            return (
                <UserDetail closeModal={() => this.setDetailUser(null)} user={this.state.user} />
            );
        }
    }

    scrollToBottom() {
        this.messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }

    render() {
        const { classes } = this.props;
        const items = this.state.chats.map(function(item) {
            return <ChatTile key={uuid()} setUser={this.setDetailUser} user={item[0]} message={item[1]}/>;
        }, this);
        return (     
            <ScrollableFeed className={classes.streamContainer}>
                { this.renderUserDetail() }
                {items}
                <div ref={this.messagesEndRef} />
            </ScrollableFeed>
        )
    }
}


export default withStyles(styles)(ChatStream);