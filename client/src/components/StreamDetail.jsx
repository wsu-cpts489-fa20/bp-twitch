import React from "react";
import { withStyles } from '@material-ui/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/fontawesome-free-solid'

const styles = {

    modal: {
        padding: "56px 8px 0px 8px",
        display: "block",
        position: "fixed", /* Stay in place */
        zIndex: 1, /* Sit on top */
        left: 0,
        top: 0,
        width: "100%", /* Full width */
        height: "100%", /* Full height */
        overflow: "auto", /* Enable scroll if needed */
        backgroundColor: "rgb(0,0,0)", /* Fallback color */
        backgroundColor: "rgba(0,0,0,0.4)", /* Black w/ opacity */
    },
    modalContent: {
        backgroundColor: "#121212",
        margin: "15% auto", /* 15% from the top and centered */
        padding: "30px",
        display: "block",
        width: "75%", /* Could be more or less, depending on screen size */
        borderRadius: "20px"
    },
    modalHeader: {
        padding: "2px 16px",
        backgroundColor: "#121212",
    },
    userContent: {
        display: "flex",
        backgroundColor: "#121212",
    },
    fullUserContent: {
        display: "block",
        backgroundColor: "#121212",
    },
    modalClose: {
        border: "none",
        float: "right",
        fontSize: "20px",
        height: "100%",
        color: "white"
    },
    userTitle: {
        // color: props => props.user.color,
        fontSize: "30px",
        textAlign: "center",
        margin: "10px"
    },
    userBio: {
        fontSize: "20px",
        color: "white",
        minHeight: "75%"
    },
    userPic: {
        borderRadius: "50%",
        maxWidth: "50%",
        margin: "auto",
        display: "block"
    },
    mainUserDetail: {
        float: "left",
        backgroundColor: "#121212",
        paddingLeft: "15px",
    },
    fullUserDetail: {
        display: "block",
        margin: "auto",
        backgroundColor: "#121212",
        paddingLeft: "15px",
    },
    sideUserDetail: {
        marginTop: "60px",
        backgroundColor: "#121212",
        flex: "65%",
        borderLeft: "1px solid darkgrey",
        paddingLeft: "15px",
    }
}


class StreamDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.unmount = false;
    }
    componentDidMount() {
        const url = "https://api.twitch.tv/helix/search/channels?query=" + this.props.channel;
        fetch(url,
            {
                method: "GET",
                headers: new Headers({
                    "Accept": "application/vnd.twitchtv.v5+json",
                    "Client-ID": "19fbkc20uggbz1a7bcka2azyr2clsu",
                    "Authorization": "Bearer " + this.props.userObj.token
                })
            }).then((response) => {
                response.json().then((streamInfo) => {
                    if(!this.unmount) {
                        this.setState({"streamInfo": streamInfo.data[0]});
                        console.log(streamInfo.data[0]);
                    }
                    
                })
        });
    }

    componentWillUnmount() {
        this.unmount = true;
    }

    render() {
        // const { classes } = this.props;
        return (
            <div style={styles.modal}>
                <div style={styles.modalContent}>
                    <div onClick={this.props.hideDetails} style={styles.modalHeader}>
                        <div style={styles.modalClose} >
                            <FontAwesomeIcon  icon="times"/>
                        </div>
                    </div>
                    <span style={{color: "white"}}>
                        { this.state.streamInfo === undefined ? "Loading..." :
                        <>
                            Display name: { this.state.streamInfo.display_name }<br />
                            Live: { this.state.streamInfo.is_live ? "Yes" : "No" }<br />
                            Started at: { Date("2020-12-10T21:54:54Z").split("GMT")[0] }<br />
                            Title: { this.state.streamInfo.title }
                        </>
                        }
                    </span>
                </div>
            </div>
        )
    }
    
}

export default withStyles(styles)(StreamDetail);