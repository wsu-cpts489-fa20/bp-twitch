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
        color: props => props.user.color,
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


class UserDetail extends React.Component {
    constructor(props) {
        super();
        this.state = {};
        this.unmount = false;
    }
    componentDidMount() {
        const url = "https://api.twitch.tv/kraken/users/" + this.props.user["user-id"];
        fetch(url,
            {
                method: "GET",
                headers: new Headers({
                    "Accept": "application/vnd.twitchtv.v5+json",
                    "Client-ID": "19fbkc20uggbz1a7bcka2azyr2clsu"
                })
            }).then((response) => {
                response.json().then((userInfo) => {
                    if(!this.unmount) {
                        this.setState(userInfo);
                        console.log(userInfo);
                    }
                    
                })
        });
    }

    componentWillUnmount() {
        this.unmount = true;
    }
    
    renderOptionalBio(classes) {
        if(this.state.bio && this.state.bio.length > 0) {
            return (
                <div className={classes.userContent}>
                        
                    <div className={classes.mainUserDetail}>
                        <div className={classes.userTitle}>{ this.state.display_name }</div>
                        <img className={classes.userPic} src={this.state.logo} />
                    </div>
                    <div className={classes.sideUserDetail}>
                        <div className={classes.userBio}>{ this.state.bio }</div>
                    </div>
                </div>
            )
        }
        else {
            return (
                <div className={classes.fullUserContent}>
                        
                    <div className={classes.fullUserContent}>
                        <div className={classes.userTitle}>{ this.state.display_name }</div>
                        <img className={classes.userPic} src={this.state.logo} />
                    </div>
                </div>
            )
        }
        
        
    }

    render() {
        const { classes } = this.props;
        return (
            <div data-testid="user-detail-modal" className={classes.modal}>
                <div className={classes.modalContent}>
                    <div onClick={this.props.closeModal} className={classes.modalHeader}>
                        <div className={classes.modalClose}>
                            <FontAwesomeIcon  icon="times"/>
                        </div>
                    </div>
                    {this.renderOptionalBio(classes)}
                </div>
            </div>
        )
    }
    
}

export default withStyles(styles)(UserDetail);
