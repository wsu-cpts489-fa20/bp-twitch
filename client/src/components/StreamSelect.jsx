import React from "react";
import Input from "@material-ui/core/Input";
import { withStyles } from '@material-ui/styles';

const styles = {
  mainInput: {
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  innerInput: {
    margin: "0 10px 0 10px",
    '&::placeholder': {
      fontStyle: 'italic',
    },
  }
}

class StreamSelect extends React.Component {
  constructor(props) {
    super();
    this.state = {
      channel: "",
    };
  }

  handleChange = (e) => {
    this.setState({ channel: e.target.value });
  }

  keyPress = (e) => {
    // if the enter key is pressed change the channel
    if (e.keyCode === 13) {
        this.reactToUserChange()
    }
  }

  reactToUserChange = () => {
      const { changeChannel } = this.props;
      const { channel } = this.state;
      changeChannel(channel);
  }

  render() {
    const { classes } = this.props;
    return (
      <>
      <Input
        className={classes.mainInput}
        defaultValue={this.state.channel}
        onChange={this.handleChange}
        onKeyDown={this.keyPress}
        placeholder="enter a channel name..."
        id="streamSelect"
        color="secondary"
        inputProps={{ 
          className: classes.innerInput,
        }}
        spellCheck={false}
        fullWidth
      />
      <span style={{
        position: "absolute",
        right: "10px",
        top: "43px",
        fontSize: "0.75em",
        color: "gray",
      }}>
        <a 
            onClick={ this.reactToUserChange }
            style={{
                cursor: "pointer"
            }}
        ><i><u>Connect to a server</u></i></a>
        &nbsp;|&nbsp; 
        <a 
            id="statsLink"
            onClick={ this.props.showDetails }
            style={{
                cursor: "pointer"
            }}
        ><i><u>Server stats</u></i></a>
      </span>
      </>
    );
  }
}

export default withStyles(styles)(StreamSelect);
