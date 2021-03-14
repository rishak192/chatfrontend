import React from 'react'
import './App.css';
import io from 'socket.io-client'
import Message from './messagecont';
import AllUser from './alluser';

const SERVER = 'https://chatbackendchat.herokuapp.com/'
// const SERVER = 'localhost:4000'
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
      chatid: "",
      users: [],
      inroom: false,
      chattingwith: "",
      typing: false
    }
  }

  componentDidUpdate() {
    mescont = document.getElementsByClassName("mes-cont")[0]
    var scrollheight = mescont.scrollHeight
    mescont.scrollTo(0, scrollheight)
    if (this.state.chatid !== "" && !this.state.inroom) {
      this.join()
      this.setState({
        inroom: true
      })
    }
  }


  componentDidMount() {
    fetch('https://chatbackendchat.herokuapp.com/alluser', {
      method: 'get',
      //   body : JSON.stringify({
      //     signupDetails
      //   }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then((res) => res.json())
      .then((json) => {
        console.log(json.result);
        this.setState({
          users: json.result
        })
      })
      .catch((error) => {
        console.error(error);
      });

    console.log("render");

    socket = io(SERVER, { 'transports': ['websocket', 'polling'] });
    console.log(socket);

    socket.on('started', data => {
      console.log(data);
      this.setState({ messages: data })
    })

    socket.on('receive', ({ mes, id, datetime }) => {
      console.log(mes, id, datetime);
      this.setState(prevState => ({
        messages: [...prevState.messages, { 'message': mes, 'userid': id, 'datetime': datetime }]
      }));
    })

    socket.on('typing', ({ userid, chatid }) => {
      this.setState({
        typing: true
      })
      console.log(userid, chatid);
      setTimeout(() => {
        this.setState({
          typing: false
        })
      }, 2000);
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
    var d = new Date(Date.now());
    if (mes !== "") {
      if (e.code === "Enter" || e === "Enter") {
        socket.emit('send', { mes, id, chatId })
        this.setState(prevState => ({
          messages: [...prevState.messages, {
            'message': mes, 'userid': this.state.id, datetime: {
              date: d.toDateString().toString(),
              time: d.toTimeString().toString()
            }
          }]
        }));
        this.setState({
          mes: ""
        })
      }
    }
  }

  join = () => {
    console.log("join");
    var chatid = this.state.chatid
    var userid = this.state.id
    if (chatid !== "" && chatid !== null) {
      if (userid !== "" && userid !== null) {
        console.log(chatid, userid);
        this.setState({
          join: true
        })
        socket.emit('join', { userid, chatid })
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

  selectUser = (name) => {
    var id = this.state.id
    if (id !== "") {
      if (id !== name) {
        var chatid = [this.state.id, name].sort()
        this.setState(prevState => ({
          chattingwith: name,
          chatid: chatid[0] + chatid[1]
        }))
        console.log(this.state.chatid);
      }else{
        alert('Choose other user!')
      }
    } else {
      alert("name is empty")
    }
  }

  typing = (e) => {
    var chatid = this.state.chatid
    var userid = this.state.id
    console.log('typing');
    this.handleChange(e)

    socket.emit('type', { userid, chatid })

  }

  render() {
    return (
      <div>
        <div className="chat-heading">
          <h1>Chat</h1>
          <div>
            {
              this.state.inroom ? <p>chatID:{this.state.chatid}</p> : <input placeholder="Enter chat id" type="text" name="chatid" onChange={this.handleChange} value={this.state.chatid} />
            }
          </div>
        </div>
        <div className="main-cont">
          <div className="chat-box">
            {
              this.state.inroom ? <div className="chattingwith">
                <p>
                  {
                    "Chatting with: " + this.state.chattingwith
                  }
                </p>
                <p id="typing-stat">
                  {
                    this.state.typing ? "typing..." : null
                  }
                </p>
              </div> : null
            }
            <div className="mes-cont">
              {
                this.state.messages.map(item => {
                  return <Message mes={item.message} time={item.datetime.time.split(' ')[0]} class={item.userid === this.state.id ? "sen" : "rec"} />
                })
              }
            </div>
            {
              this.state.join ? <div className="input-send">
                <input type="text" name="mes" onKeyPress={this.send} onChange={this.typing} value={this.state.mes} />
                <button onClick={() => this.send("Enter")}>Send</button>
              </div> : <div className="input-send">
                <input placeholder="Enter your name..." type="text" name="id" onChange={this.handleChange} value={this.state.id} />
                <button onClick={this.join}>Join</button>
              </div>
            }
          </div>
          {
            !this.state.inroom ? <div className="users-cont">
              <div className="select-user">
                <p>Select a user</p>
              </div>
              <AllUser selectUser={this.selectUser} users={this.state.users} />
            </div> : null
          }
        </div>
      </div>
    )
  }

}

export default App;
