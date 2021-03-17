import React from 'react'
import './App.css';
import io from 'socket.io-client'
import Message from './messagecont';
import AllUser from './alluser';
import PrevChats from './prevchats';
import { json } from 'body-parser';
import Image from './image';

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
      type: "",
      messages: [],
      join: false,
      chatid: "",
      users: [],
      inroom: false,
      chattingwith: "",
      typing: false,
      prevchats: {},
      showchat: false,
      online: {}
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


    socket.on('receive', ({ mes, id, datetime, type }) => {
      // console.log(mes, id, datetime,type);
      this.setState(prevState => ({
        [`message${this.state.chatid}`]: [...prevState[`message${this.state.chatid}`], { 'message': mes, 'type': type, 'userid': id, 'datetime': datetime }]
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

    socket.on('friendsonline', online => {
      // console.log('friends online',online);
      this.setState({
        online: online
      })
    })

    socket.on('online', online => {
      // console.log("online",online);
      // this.setState(prevState=>({
      //   online:{...prevState.online,[userid]:true}
      // }),()=>console.log(this.state.online))
      this.setState({
        online: online
      })
    })

    socket.on('disconnected', userid => {
      // console.log("disconnected",userid);
      this.setState(prevState => ({
        online: { ...prevState.online, [userid]: false }
      }))
    })

    // socket.on('imagereceived', ({ img, result }) => {
    //   console.log(img);
    //   console.log(result);
    //   var image=document.createElement('img')
    //   image.style.height="200px"
    //   image.style.width="200px"
    //   image.src=result
    //   document.body.appendChild(image)
    // })

  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  sendMes = (e) => {
    // console.log('sendmes');
    if (e.code === "Enter" || e === "Enter") {
      this.setState({
        type: 'txt'
      }, () => this.send())
    }
  }

  send = () => {
    // console.log('sending');
    const mes = this.state.mes
    const type = this.state.type
    const id = this.state.id
    const chatId = this.state.chatid
    var d = new Date(Date.now());
    if (mes !== "") {
      socket.emit('send', { mes, id, chatId, type })
      this.setState(prevState => ({
        [`message${chatId}`]: [...prevState[`message${chatId}`], {
          'message': mes, 'type': type, 'userid': id, datetime: {
            date: d.toDateString().toString(),
            time: d.toTimeString().toString()
          }
        }]
      }));
      this.setState({
        mes: "",
        type: ""
      })
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
        })
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

  openFiles = () => {
    var file = document.getElementById('file')
    file.click()
  }

  sendFile = (e) => {
    // var file = document.getElementById('file')
    var fileReader = new FileReader();

    // console.log("changed");
    // console.log(e.target.files[0]);
    // fileReader.readAsText(e.target.files[0])
    fileReader.readAsDataURL(e.target.files[0])
    // fileReader.readAsArrayBuffer(file)

    var chatid = this.state.chatid
    var userid = this.state.id

    fileReader.addEventListener('load', () => {
      // console.log(fileReader.result);
      var result = fileReader.result
      // console.log(result);
      socket.emit('image', { chatid, userid, result })
      this.setState({
        mes: result,
        type: 'img'
      },()=>{
        // console.log('type image');
        this.send()
      })
      // fetch(`${SERVER}/image`, {
      //   method: 'post',
      //   body: JSON.stringify({
      //     data: [fileReader.result]
      //   }),
      //   headers: {
      //     'Accept': 'application/json',
      //     'Content-Type': 'application/json'
      //   }
      // })
      //   .then(res => res.json())
      //   .then(res => {
      //     console.log(res.image)
      //     const img = new Image()
      //     img.height = 500
      //     img.width = 500
      //     img.src = res.image
      //     document.body.appendChild(img)
      //   })
      //   .catch(err => console.log(err))
      // var img=document.createElement('img')
      // img.style.height="100px"
      // img.style.width="100px"
      // img.src=result
      // document.body.appendChild(img)
      // img.onload= () => {
      //   const canvas = document.createElement('canvas')
      //   const context = canvas.getContext('2d')
      //   context.drawImage(img, 0, 0)
      //   const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      //   const data = imageData.data
      //   console.log(data);
      //   for (var i = 0; i <= data.length; i += 4) {
      //     const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
      //     data[i] = avg
      //     data[i + 1] = avg
      //     data[i + 2] = avg
      //   }

      //   context.putImageData(imageData, 0, 0)
      //   document.body.append(canvas)

      //   canvas.toBlob((blob)=>{
      //     const form=new FormData()
      //     form.append('image',blob,'first.jpg')

      //   })
      // }
    })
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
                  this.state.typing ? <div className="typing-stat">
                    <p >
                      typing...
                  </p>
                  </div> : null
                }
              </div> : null
            }
            <div className="mes-cont">
              {
                this.state[`message${this.state.chatid}`] !== undefined ? this.state[`message${this.state.chatid}`].map(item => {
                  return item.type==='txt'?
                  <Message mes={item.message} time={item.datetime.time.split(' ')[0]} class={item.userid === this.state.id ? "sen" : "rec"} />
                  :
                  <Image src={item.message} time={item.datetime.time.split(' ')[0]} class={item.userid === this.state.id ? "sen" : "rec"}/>
                }) : null
              }
            </div>
            {
              this.state.inroom ? <div className="input-send">
                <input id="file" onChange={this.sendFile} type="file" hidden />
                <div>
                  <p onClick={this.openFiles}>+</p>
                  <input type="text" name="mes" onKeyPress={this.sendMes} onChange={this.typing} value={this.state.mes} />
                </div>
                <button onClick={() => this.sendMes("Enter")}>Send</button>
              </div> : <div className="join">
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
