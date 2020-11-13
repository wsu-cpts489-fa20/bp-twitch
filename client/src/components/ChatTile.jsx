import React from "react";
import { makeStyles } from '@material-ui/styles';

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
        display: "flex",
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
    return (
        <div className={classes.tile}>
            <div className={classes.author}>{user['display-name']}</div>
            <div className={classes.message}>{props.message}</div>
        </div>
    )
}

export default ChatTile;