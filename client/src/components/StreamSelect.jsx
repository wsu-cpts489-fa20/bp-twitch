import React from "react";
import Input from "@material-ui/core/Input";
import Autocomplete from "@material-ui/lab/Autocomplete";
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

class StreamSelect extends React.Component {
  constructor(props) {
    super();
    this.state = {
      channel: "",
      suggestions: []
    };
  }

  handleChange = (e) => {
    this.setState({ channel: e.target.value });

    const requestUrl = `https://api.twitch.tv/helix/search/channels?query=${this.state.channel}`;
    console.log('Request URL: ', requestUrl);
    const response = fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Authorization': this.props.accessToken,
        'Client-Id': '19fbkc20uggbz1a7bcka2azyr2clsu'
      }
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success: ', data);
    })
    .catch(error => {
      console.log('Error: ', error);
    });
  }

  keyPress = (e) => {
    // if the enter key is pressed change the channel
    if (e.keyCode === 13) {
      const { changeChannel } = this.props;
      const { channel } = this.state;
      changeChannel(channel);
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <Input
        className={classes.mainInput}
        defaultValue={this.state.channel}
        onChange={this.handleChange}
        onKeyDown={this.keyPress}
        //options={this.state.suggestions}
        placeholder="enter a channel name..."
        id="streamSelect"
        color="secondary"
        inputProps={{ 
          className: classes.innerInput,
        }}
        spellCheck={false}
        fullWidth
      />
    );
  }
}

export default withStyles(styles)(StreamSelect);
