import React from 'react'
import './App.css';
import io from 'socket.io-client'
import Message from './messagecont';
import AllUser from './alluser';
import PrevChats from './prevchats';

const SERVER = 'https://chatbackendchat.herokuapp.com'
// const SERVER = 'http://localhost:4000'
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
      typing: false,
      prevchats: {},
      showchat: false,
      online:{}
    }
  }

  componentDidUpdate() {
    mescont = document.getElementsByClassName("mes-cont")[0]
    var scrollheight = mescont.scrollHeight
    mescont.scrollTo(0, scrollheight)
  }

  componentDidMount() {
    fetch(`${SERVER}/alluser`, {
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
        // console.log(json.result);
        this.setState({
          users: json.result
        })
      })
      .catch((error) => {
        console.error(error);
      });

    // console.log("render");

    if (socket === undefined) {
      socket = io(SERVER, { 'transports': ['websocket', 'polling'] });
    }
    // console.log(socket);
    socket.on('started', data => {
      if (this.state[`message${this.state.chatid}`] === undefined) {
        this.setState({
          [`message${this.state.chatid}`]: data
        })
      } else {
      }
    })


    socket.on('receive', ({ mes, id, datetime }) => {
      // console.log(mes, id, datetime);
      this.setState(prevState => ({
        [`message${this.state.chatid}`]: [...prevState[`message${this.state.chatid}`], { 'message': mes, 'userid': id, 'datetime': datetime }]
      }));
    })

    socket.on('typing', ({ userid, chatid }) => {
      if (!this.state.typing) {
        // console.log(this.state.typing);
        setTimeout(() => {
          // console.log("set typing");
          this.setState({
            typing: false
          })
        }, 2000);
        this.setState({
          typing: true
        })
      }
    })

    socket.on('friendsonline',online=>{
      // console.log('friends online',online);
      this.setState({
        online:online
      })
    })

    socket.on('online',online=>{
      // console.log("online",online);
      // this.setState(prevState=>({
      //   online:{...prevState.online,[userid]:true}
      // }),()=>console.log(this.state.online))
      this.setState({
        online:online
      })
    })

    socket.on('disconnected',userid=>{
      // console.log("disconnected",userid);
      this.setState(prevState=>({
        online:{...prevState.online,[userid]:false}
      }))
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
          [`message${this.state.chatid}`]: [...prevState[`message${this.state.chatid}`], {
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

  showPrevChats = () => {
    // console.log(this.state.id);
    fetch((`${SERVER}/prevchats/${this.state.id}`), {
      method: 'get',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then((res) => res.json())
      .then((json) => {
        // console.log(json.result.chatid);
        this.setState({
          prevchats: json.result.chatid
        },()=>console.log(this.state.prevchats))
        // for(var item in json.result.chatid){
        //   console.log(item);
        // }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  join = () => {
    // console.log("join");
    // console.log(this.state.chattingwith);
    var chatid = this.state.chatid
    var userid = this.state.id
    var chattingwith = this.state.chattingwith
    if (chatid !== "" && chatid !== null) {
      if (userid !== "" && userid !== null) {

        if (!this.state.join) {
          this.showPrevChats()
          this.setState({
            join: true
          })
        }

        socket.emit('join', { userid, chatid, chattingwith })
        // socket.on("joinsuccess", data => {
        //   alert("You have joined " + data + " room")
        // })
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
        this.setState({
          chattingwith: name,
          chatid: chatid[0] + chatid[1],
          inroom: true
        }, () => this.join())
        // console.log(this.state.chatid);
      } else {
        alert('Choose other user!')
      }
    } else {
      alert("name is empty")
    }
  }

  typing = (e) => {
    var chatid = this.state.chatid
    var userid = this.state.id
    this.handleChange(e)

    socket.emit('type', { userid, chatid })

  }

  _renderObject() {
    return Object.keys(this.state.prevchats).map((obj, i) => {
      return (
        <div>
          {obj}
        </div>
      )
    })
  }

  selectPrevChat = (prevchatid) => {
    if (prevchatid !== this.state.chatid) {
      socket.emit('leaveroom', this.state.chatid)
      this.setState({
        join: false
      }, () => {
        if (!this.state.join) {
          var both = prevchatid.split(this.state.id)
          both.splice(both.indexOf(""), 1)
          this.setState({
            messages: [],
            chatid: prevchatid,
            inroom: true,
            chattingwith: both[0],
            join: true
          }, () => this.join())
        }
      })
    }
  }

  joinWithChatid = () => {
    var both = this.state.chatid.split(this.state.id)
    both.splice(both.indexOf(""), 1)
    this.setState({
      chattingwith: both[0]
    }, () => this.join())
  }

  showChat = () => {
    this.setState(prevState => ({
      showChat: !prevState.showChat
    }))
  }

  render() {
    return (
      <div>
        <div className="chat-heading" style={{ display: "flex", alignItems: "Center" }}>
          {
            this.state.inroom ? <button style={{ height: "50%", backgroundColor: "white", border: "none" }} onClick={this.showChat}>Show Chats</button> : null
          }
          <div style={{ width: "100%" }}>
            <h1>Chat</h1>
            <div>
              {
                this.state.inroom ? <p>chatID:{this.state.chatid}</p> : <input placeholder="Enter chat id" type="text" name="chatid" onChange={this.handleChange} value={this.state.chatid} />
              }
            </div>
          </div>
        </div>
        <div className="main-cont">
          <div className="chat-box">
            {
              this.state.join ? <div className="chattingwith">
                <p>
                  {
                    "Chatting with: " + this.state.chattingwith
                  }
                </p>
                {
                  this.state.typing?<div className="typing-stat">
                  <p >
                      typing...
                  </p>
                </div>:null
                }
              </div> : null
            }
            <div className="mes-cont">
              {
                this.state[`message${this.state.chatid}`] !== undefined ? this.state[`message${this.state.chatid}`].map(item => {
                  return <Message mes={item.message} time={item.datetime.time.split(' ')[0]} class={item.userid === this.state.id ? "sen" : "rec"} />
                }) : null
              }
            </div>
            {
              this.state.inroom ? <div className="input-send">
                <input type="text" name="mes" onKeyPress={this.send} onChange={this.typing} value={this.state.mes} />
                <button onClick={() => this.send("Enter")}>Send</button>
              </div> : <div className="input-send">
                <input placeholder="Enter your name..." type="text" name="id" onChange={this.handleChange} value={this.state.id} />
                <button onClick={this.joinWithChatid}>Join</button>
              </div>
            }
          </div>
          {
            !this.state.inroom ? <div className="users-cont">
              <div className="select-user">
                <p>Select a user</p>
              </div>
              <AllUser selectUser={this.selectUser} users={this.state.users} />
            </div> :
              <div className="prev-chats" style={{ display: this.state.showChat ? "block" : "none" }}>
                {
                  Object.keys(this.state.prevchats).map((obj, i) => {
                    return (
                      <PrevChats online={this.state.online} userid={this.state.id} selectPrevChat={this.selectPrevChat} currchatid={this.state.chatid} prevchats={obj} />
                    )
                  })
                }
              </div>
          }
        </div>
      </div>
    )
  }

}

export default App;
