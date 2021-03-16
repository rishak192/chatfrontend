import React from 'react'
import './message.css'

class Message extends React.Component {

    render() {
        return (
            <div className={this.props.class}>
                <div className="mess-cont">
                    <p className="time">{this.props.time}</p>
                    <p>{this.props.mes}</p>
                </div>
            </div>
        )
    }
}

export default Message
