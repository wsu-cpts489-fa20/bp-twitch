import React from 'react';
import { withStyles } from '@material-ui/styles';
import uuid from 'react-uuid';
import ChatTile from "./ChatTile";
import UserDetail from "./UserDetail";

const styles = {
    streamContainer: {
        overflow: "auto",
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
            user: null
        }
        this.messagesEndRef = React.createRef();
        this.setDetailUser = this.setDetailUser.bind(this);
    }

    componentDidUpdate(prevProps) {
        const { client } = this.props;
        if (!prevProps.client || client.channels[0] !== prevProps.client.channels[0]) {
            this.updateTwitchClient();
            this.setState({chats: []});
        }
    }

    updateTwitchClient() {
        const { client } = this.props;
        client.connect();
        client.on('message', (channel, user, message, self) => {
            if (this.state.chats.length === 50)
                this.state.chats.shift();
            this.state.chats.push([user, message])
            this.setState({chats: this.state.chats});
            this.scrollToBottom();
        });
    }

    scrollToBottom() {
        this.messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
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

    render() {
        const { classes } = this.props;
        const items = this.state.chats.map(function(item) {
            return <ChatTile key={uuid()} setUser={this.setDetailUser} user={item[0]} message={item[1]}/>;
        }, this);
        return (
            <div className={classes.streamContainer} ref={this.containerRef} >
                { this.renderUserDetail() }
                {items}
                <div ref={this.messagesEndRef} />
            </div>

        )
    }
}


export default withStyles(styles)(ChatStream);