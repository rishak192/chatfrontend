import React from 'react'
import './prevchats.css'

class PrevChats extends React.Component{

    constructor(props){
        super(props)
        this.state={
            friend:""
        }
    }

    componentDidMount(){
        // console.log(this.props.prevchats,this.props.userid);
        var friend=this.props.prevchats.split(this.props.userid)
        var i=friend.indexOf("")
        friend.splice(i,1)
        // console.log(friend);
        this.setState({
            friend:friend
        })
    }

    render(){
        return(
            <div className={this.props.prevchats===this.props.currchatid?"selected-chat":"chatid-cont"} onClick={()=>this.props.selectPrevChat(this.props.prevchats)}>
                <p>{this.state.friend}</p>
            </div>
        )
    }
}

export default PrevChats
