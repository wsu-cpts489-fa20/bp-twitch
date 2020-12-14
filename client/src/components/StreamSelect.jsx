import React from "react";
import Input from "@material-ui/core/Input";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import { withStyles } from '@material-ui/styles';

const styles = {
  mainInput: {
    overflow: "auto",
    "&::-webkit-scrollbar": {
      display: "none"
    }
  },
  innerInput: {
    '&::placeholder': {
      fontStyle: 'italic',
    }
  },
  option: {
    '&[data-focus="true"]': {
      borderColor: 'transparent'
    }
  },
  listbox: {
    "&::-webkit-scrollbar": {
      display: "none"
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
    const { classes } = this.props;
    return <Typography {...params} noWrap>{option.display_name}</Typography>;
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
        blurOnSelect
        classes={{
          inputRoot: classes.innerInput,
          option: classes.option,
          listbox: classes.listbox
        }}
        options={this.state.suggestions}
        getOptionLabel={(option) => option.display_name}
        renderInput={(params) => {
          return <TextField {...params} className={classes.innerInput} placeholder="Enter a channel name..." />
        }}
        renderOption={this.renderOption}
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
