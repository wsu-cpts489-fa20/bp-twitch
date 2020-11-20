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

    setText = (newText) => {
        this.setState({"chatBoxText": newText.target.value})
    }  

    handleChange = (e) => {
        this.setState({ chatBoxText: e.target.value });
    }

    keyPress = (e) => {
        const { client, channel } = this.props;
        const { chatBoxText } = this.state;
        // if the enter key is pressed change the channel
        if (e.keyCode === 13) {
            client.say(channel, chatBoxText);
            this.setState({chatBoxText: ""})
        }
    }

    render() {
        const { classes, isAnon, client } = this.props;
        const { chatBoxText } = this.state;
        return (
            (!isAnon && client ? 
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
                : null
            )
        )
    }
}

export default withStyles(styles)(ChatTextBox);