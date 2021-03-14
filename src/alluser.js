import React from 'react'
import './alluser.css'

class AllUser extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div >
                {
                    this.props.users.map(item => {
                        return (
                            <div className="user-box" onClick={()=>this.props.selectUser(item.name)}>
                                <p>{item.name}</p>
                            </div>
                        )
                    })
                }
            </div>
        )
    }
}

export default AllUser