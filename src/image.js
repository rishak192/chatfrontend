import React from 'react'
import './message.css'

class Image extends React.Component {

    render() {
        return (
            <div className={this.props.class}>
                <div className="mess-cont">
                    <p className="time">{this.props.time}</p>
                    <img width="85%" src={this.props.src} alt="sry"/>
                </div>
            </div>
        )
    }
}

export default Image
