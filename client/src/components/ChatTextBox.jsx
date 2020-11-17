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
        super(props);
        this.state = {
            chatBoxText: ""
        }
    }

    setText = (newText) => {
        console.log(newText)
        this.setState({"chatBoxText": newText.target.value})
    }  

    handleChange = (e) => {
        this.setState({ chatBoxText: e.target.value });
    }

    keyPress = (e) => {
        // if the enter key is pressed change the channel
        if (e.keyCode === 13) {
            console.log("Sending chat")
        }
    }

    render() {
        const { classes } = this.props;
        return (
            <Input
                className={classes.mainInput}
                defaultValue={this.state.chatBoxText}
                onChange={this.handleChange}
                onKeyDown={this.keyPress}
                placeholder="Enter text to chat"
                color="secondary"
                inputProps={{ 
                    className: classes.innerInput,
                }}
                spellCheck={false}
                id="chatTextBox"
                fullWidth
            />
        )
    }
}

export default withStyles(styles)(ChatTextBox);