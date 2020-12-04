import React from "react";
import Input from "@material-ui/core/Input";
import { withStyles } from '@material-ui/styles';

const styles = {
    mainInput: {
        backgroundColor: "black",
    },
    innerInput: {
        color: "white",
        margin: "0 10px 0 10px",
        '&::placeholder': {
            fontStyle: 'italic',
        },
    }
}

class ChatTextBox extends React.Component {
    constructor(props) {
        super();
        this.state = {
            chatBoxText: ""
        }
    }

    handleChatSend = () => {
        const { client, channel } = this.props;
        const { chatBoxText } = this.state;
        client.say(channel, chatBoxText);
        this.setState({chatBoxText: ""})
    }

    setText = (newText) => {
        this.setState({"chatBoxText": newText.target.value})
    }  

    handleChange = (e) => {
        this.setState({ chatBoxText: e.target.value });
    }

    keyPress = (e) => {
        if (e.keyCode === 13) {
            this.handleChatSend()
        }
    }

    render() {
        const { classes, isAnon, client } = this.props;
        const { chatBoxText } = this.state;
        return (
            (!isAnon && client ? 
                <>
                <Input
                    className={classes.mainInput}
                    value={chatBoxText}
                    onChange={this.handleChange}
                    onKeyDown={this.keyPress}
                    placeholder="Send a message"
                    color="secondary"
                    inputProps={{ 
                        className: classes.innerInput,
                    }}
                    spellCheck={false}
                    id="chatTextBox"
                    fullWidth
                />
                <a 
                    onClick={ this.handleChatSend }
                    style={{
                        position: "absolute",
                        right: "10px",
                        color: "gray",
                        bottom: "10px",
                        fontSize: "0.75em",
                        cursor: "pointer"
                    }}
                ><i><u>Send</u></i></a>
                </>
                : null
            )
        )
    }
}

export default withStyles(styles)(ChatTextBox);