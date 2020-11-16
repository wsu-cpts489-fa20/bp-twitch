import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import CloseTwoToneIcon from '@material-ui/icons/CloseTwoTone';
import RemoveTwoToneIcon from '@material-ui/icons/RemoveTwoTone';
import FullscreenTwoToneIcon from '@material-ui/icons/FullscreenTwoTone';

const useStyles = makeStyles({
  dragbar: {
    "-webkit-app-region": "drag",
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
    paddingBottom: "20px",
    transition: "0.2s",
    fill: 'rgba(255,255,255, 0.5)',
    '&:hover': {
      fill: "white",
    }
  },
  title : {
    position: "absolute",
    color: "rgba(255,255,255, 0.5)",
    fontSize: "12px",
    fontWeight: "bold",
    fontFamily: "Roboto",
    padding: "4px 0px 2px 8px"
  }
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

function ElectronBar() {
  const classes = useStyles();
  return (
    <div className={classes.dragbar}>
      <div className={classes.title}></div>
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
