import React from 'react'
import './prevchats.css'

class PrevChats extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            friend: ""
        }
    }

    componentDidMount() {
        // console.log(this.props.prevchats,this.props.userid);
        var friend = this.props.prevchats.split(this.props.userid)
        var i = friend.indexOf("")
        friend.splice(i, 1)
        // console.log(friend[0]);
        // console.log(this.props.online[friend[0]]);
        this.setState({
            friend: friend[0]
        })
    }

    render() {
        return (
            <div>
                <div className={this.props.prevchats === this.props.currchatid ? "selected-chat" : "chatid-cont"} onClick={() => this.props.selectPrevChat(this.props.prevchats)}>
                    <div style={{ display: "flex" }}>
                        <p>{this.state.friend}</p>
                        {
                            this.props.notif !== 0 ? <div className="notif"><p>{this.props.notif}</p></div> : null
                        }
                    </div>
                    <div className={this.props.online[this.state.friend] ? "online" : "offline"} />
                </div>
            </div>
        )
    }
}

export default PrevChats
