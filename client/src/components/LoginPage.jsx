import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import { Icon } from "@iconify/react";
import twitchIcon from "@iconify-icons/mdi/twitch";
import { Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  wrapper: {
    height: "100%",
    width: "100%",
    marginTop: "40%",
    textAlign: "center",
  },
  button: {
    margin: theme.spacing(1),
    width: "75%",
    height: "40px",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
  },
  twitchButton: {
    backgroundColor: "rgba(145, 70, 255, 0.7)",
    "&:hover": {
      backgroundColor: "rgba(145, 70, 255, 1)",
    },
  },
}));

function handleTwitchOauthLogin() {
  window.open("/auth/twitch", "_self");
}

function LoginPage(props) {
  const classes = useStyles();
  return (
    <div className={classes.wrapper}>
      <Button
        variant="contained"
        color="secondary"
        className={[classes.button, classes.twitchButton].join(" ")}
        onClick={handleTwitchOauthLogin}
        startIcon={<Icon icon={twitchIcon} />}
        id="twitchLoginBtn"
      >
        <Typography>Login With Twitch</Typography>
      </Button>
      <Button
        variant="contained"
        color="secondary"
        className={classes.button}
        onClick={props.setAnonMode}
      >
        <Typography>Continue as Anonymous User</Typography>
      </Button>
    </div>
  );
}

export default LoginPage;
