import React from 'react'
import './message.css'

class Message extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div className={this.props.class}>
                <div className="mess-cont">
                    <p>{this.props.mes}</p>
                </div>
            </div>
        )
    }
}

export default Message