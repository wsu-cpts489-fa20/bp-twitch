import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import CloseTwoToneIcon from '@material-ui/icons/CloseTwoTone';
import RemoveTwoToneIcon from '@material-ui/icons/RemoveTwoTone';
import FullscreenTwoToneIcon from '@material-ui/icons/FullscreenTwoTone';

const useStyles = makeStyles({
  dragbar: {
    "-webkit-app-region": "drag",
    textAlign: "center",
  },
  closeButton: {
    width: "40px",
    height: "100%",
    float: "right",
    transition: "0.2s",
    "-webkit-app-region": "no-drag",
    '&:hover': {
      backgroundColor: "red",
    }
  },
  defaultButton: {
    width: "40px",
    height: "100%",
    float: "right",
    transition: "0.2s",
    "-webkit-app-region": "no-drag",
    '&:hover': {
      backgroundColor: "rgba(255,255,255,0.2)",
    }
  },
  closeIcon: {
    width: '100%',
    height: '100%',
    transition: "0.2s",
    fill: 'rgba(255,255,255, 0.5)',
    '&:hover': {
      fill: "white",
    }
  },
  minimizeIcon: {
    width: '100%',
    height: '100%',
    transition: "0.2s",
    fill: 'rgba(255,255,255, 0.5)',
    '&:hover': {
      fill: "white",
    }
  },
  userInfo: {
    color: 'rgba(255,255,255, 0.5)',
    textAlign: "center",
    display: "inline-block",
    overflow: "auto"
  },
  displayName: {
    display: "inline-block",
    position: "absolute",
    marginLeft: "25px"
  },
  profilePic: props => ({
    width: "20px",
    height: "20px",
    borderRadius: "4px",
    display: "inline-block",
    backgroundImage: `url(${props.image})`,
    backgroundSize: "cover",
    margin: "2px 0 2px 0"
  })
});

function closeElectronWindow() {
  window.ipcRenderer.send("close-window");
}

function minimizeElectronWindow() {
  window.ipcRenderer.send("minimize-window");
}

function maximizeElectronWindow() {
  window.ipcRenderer.send("maximize-window");
}

function ElectronBar(props) {
  const { user } = props;
  const styleProps = {
    image:  user !== null ? user.profile_image_url : "none"
  }
  const classes = useStyles(styleProps);
  console.log(styleProps);
  return (
    <div className={classes.dragbar}>
      { user && 
        <div className={classes.userInfo}>
          <div className={classes.displayName} data-testid="electron-bar-displayname">{user.display_name}</div>
          <div className={classes.profilePic}/>
        </div>
      }
      <div onClick={closeElectronWindow} className={classes.closeButton}> 
        <CloseTwoToneIcon className={classes.closeIcon} /> 
      </div>
      <div onClick={maximizeElectronWindow} className={classes.defaultButton}> 
        <FullscreenTwoToneIcon className={classes.closeIcon} /> 
      </div>
      <div onClick={minimizeElectronWindow} className={classes.defaultButton}> 
        <RemoveTwoToneIcon className={classes.minimizeIcon} /> 
      </div>
    </div>
  );
}

export default ElectronBar;
