import React from "react";
import TMI from "tmi.js";
import { withStyles } from "@material-ui/styles";
import ChatStream from "../components/ChatStream";
import StreamSelect from "../components/StreamSelect";
import ElectronBar from "../components/ElectronBar";
import LoginPage from "../components/LoginPage";

const styles = {
  appcontainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#121212",
    display: "grid",
    "grid-template-rows": "24px .1fr 1fr",
  },
};

class TwitchChatClient extends React.Component {
  constructor() {
    super();
    this.state = {
      userObj: null,
      client: null,
      isAuthenticated: false,
      isAnonymous: false,
    };
  }

  componentDidMount() {
    const { isAuthenticated } = this.state;
    if (!isAuthenticated) {
      fetch("/auth/test")
        .then((response) => response.json())
        .then((obj) => {
          if (obj.isAuthenticated) {
            this.setState({
              userObj: obj.user,
              isAuthenticated: true,
            });
          }
        });
    }
  }

  setAnonMode = () => {
    this.setState({isAnonymous: true});
  }

  changeChannel = (newChannel) => {
    const { client } = this.state;
    if (client) client.disconnect();
    const newClient = new TMI.Client({
      connection: {
        reconnect: true,
        secure: true,
      },
      channels: [newChannel],
    });
    this.setState({ client: newClient });
  };

  render() {
    const { client, isAuthenticated, isAnonymous } = this.state;
    const { classes } = this.props;
    return (
      <div className={classes.appcontainer}>
        <ElectronBar />
        {!isAuthenticated && !isAnonymous ? (
          <LoginPage setAnonMode={this.setAnonMode} />
        ) : (
          <>
            <StreamSelect changeChannel={this.changeChannel} />
            <ChatStream client={client} />
          </>
        )}
      </div>
    );
  }
}

export default withStyles(styles)(TwitchChatClient);
