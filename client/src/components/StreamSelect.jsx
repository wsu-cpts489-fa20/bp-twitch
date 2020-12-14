import React from "react";
import Input from "@material-ui/core/Input";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import { withStyles } from '@material-ui/styles';

const styles = {
  mainInput: {
    backgroundColor: "black"
  },
  innerInput: {
    color: "white", 
    margin: "0 10px 0 10px",
    '&::placeholder': {
      fontStyle: 'italic',
    }
  }
}

class StreamSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      channel: "",
      suggestions: []
    };
  }

  handleChange = (newInputValue) => {
    console.log("Input received.");
    this.setState({ channel: newInputValue });

    const requestUrl = `/search/channels?accessToken=${encodeURIComponent(this.props.accessToken)}&searchValue=${encodeURIComponent(newInputValue)}&liveOnly=${true}`;
    fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(response => {
        const newSuggestions = ((Object.keys(response).length === 0 && response.constructor === Object) || response.data === undefined) ? [] : response.data;
        this.setState({ suggestions: newSuggestions });
      });
  }

  renderOption = (option, params) => {
    return <Typography {...params} noWrap>{option.display_name}</Typography>;
  }

  render() {
    const { classes } = this.props;
    return (
      <Autocomplete
        freeSolo
        className={classes.mainInput}
        onInputChange={(event, newInputValue) => {
          this.handleChange(newInputValue)
        }}
        onChange={(event, newValue) => {
          this.props.changeChannel(newValue.display_name)
        }}
        id="streamSelect"
        color="secondary"
        fullWidth
        blurOnSelect
        classes={{inputRoot: classes.innerInput}}
        options={this.state.suggestions}
        getOptionLabel={(option) => option.display_name}
        renderInput={(params) => {
          return <TextField {...params} className={classes.innerInput} placeholder="Enter a channel name..." />
        }}
        renderOption={this.renderOption}
      />
    );
  }
}

export default withStyles(styles)(StreamSelect);
