import React from 'react'
import './App.css';
import io from 'socket.io-client'
import Message from './messagecont';

const SERVER = 'https://chatbackendchat.herokuapp.com/'
let socket
var mescont

class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      id: "",
      mes: "",
      messages: [],
      join: false,
      chatid: ""
    }
  }

  componentDidUpdate() {
    mescont = document.getElementsByClassName("mes-cont")[0]
    var scrollheight = mescont.scrollHeight
    mescont.scrollTo(0, scrollheight)
  }


  componentDidMount() {
    console.log("render");

    socket = io(SERVER, { 'transports': ['websocket', 'polling'] });
    console.log(socket);

    socket.on('started', data => {
      console.log(data);
    })

    socket.on('receive', ({ mes, id }) => {
      console.log("received");
      this.setState(prevState => ({
        messages: [...prevState.messages, [mes, id === this.state.id ? "sen" : "rec"]]
      }));
    })

  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  send = (e) => {
    // console.log(e.charCode,e.code);
    const mes = this.state.mes
    const id = this.state.id
    const chatId = this.state.chatid
    if (mes !== "") {
      if (e.code === "Enter" || e === "Enter") {
        socket.emit('send', { mes, id, chatId })
        this.setState(prevState => ({
          messages: [...prevState.messages, [mes, "sen"]]
        }));
        this.setState({
          mes: ""
        })
      }
    }
  }

  join = () => {
    if (this.state.chatid !== "") {
      if (this.state.id !== "") {
        this.setState({
          join: true
        })
        socket.emit('join', this.state.chatid)
        socket.on("joinsuccess", data => {
          alert("You have joined " + data + " room")
        })
      } else {
        alert("ID id empty")
      }
    } else {
      alert("Chat id is empty")
    }
  }

  render() {
    return (
      <div>
        <div className="chat-heading">
          <h1>Chat</h1>
          <div>
            <input placeholder="Enter chat id" type="text" name="chatid" onChange={this.handleChange} value={this.state.chatid} />
          </div>
        </div>
        <div className="chat-box">
          <div className="mes-cont">
            {
              this.state.messages.map(item => {
                return <Message mes={item[0]} class={item[1]} />
              })
            }
          </div>
          {
            this.state.join ? <div className="input-send">
              <input type="text" name="mes" onKeyPress={this.send} onChange={this.handleChange} value={this.state.mes} />
              <button onClick={() => this.send("Enter")}>Send</button>
            </div> : <div className="input-send">
              <input placeholder="Enter your name..." type="text" name="id" onChange={this.handleChange} value={this.state.id} />
              <button onClick={this.join}>Join</button>
            </div>
          }
        </div>
      </div>
    )
  }

}

export default App;
