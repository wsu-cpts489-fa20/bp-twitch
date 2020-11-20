import React from "react";
import uuid from 'react-uuid';
import { makeStyles } from '@material-ui/styles';

const badges = {
    "broadcaster": "https://static-cdn.jtvnw.net/badges/v1/5527c58c-fb7d-422d-b71b-f309dcb85cc1/1",
    "premium": "https://static-cdn.jtvnw.net/badges/v1/bbbe0db0-a598-423e-86d0-f9fb98ca1933/1"
}

const useStyles = makeStyles({
    tile: {
        width: "100%",
        minHeight: "40px",
        overflow: "hidden",
        display: "flex",
        marginTop: "4px"
    },
    author: {
        minWidth: "20%",
        backgroundColor: "rgba(255,255,255,0.15)",
        alignItems: "stretch",
        textAlign: "center",
        borderRadius: "4px",
        display: "inline-block",
        paddingTop: "10px",
        verticalAlign: "center",
        flexDirection: "column",
        justifyContent: "center",
        margin: "0px 2px 0px 2px",
        color: props => props.user.color
    },
    message: {
        width: "80%",
        backgroundColor: "rgba(255,255,255,0.1)",
        alignItems: "stretch",
        color: "white",
        paddingLeft: "10px",
        borderRadius: "4px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        margin: "0px 2px 0px 2px"
    }
});

function ChatTile (props) {
    const { user } = props;
    if (!user.color) user.color = "#FFFFFF";
    const classes = useStyles(props);
    var chatBadges = Object.keys(user.badges || {})
    return (
        <div className={classes.tile}>
            <div onClick={() => props.setUser(user)} className={classes.author}>
                { chatBadges.map(value => { 
                    return (
                    <React.Fragment key={uuid()}>
                        <img style={{width: "14px", height: "14px" }} src={badges[value]} /> 
                        <span>&nbsp;</span>
                    </React.Fragment>
                    )
                })}
                <div  style={{display: "inline-block", paddingTop:"-5px"}}>{user['display-name']}</div>
            </div>
            <div className={classes.message}>{props.message}</div>
        </div>
    )
}

export default ChatTile;
