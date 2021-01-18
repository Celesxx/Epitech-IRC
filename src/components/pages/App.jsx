import React from 'react';
import config from '../../config';
import io from 'socket.io-client';

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import BottomBar from './BottomBar.jsx';
import NavBar from './navbar.jsx';
import '../css/App.css';

var nick = false;
var username;
var channel = "general"
var allChannel = ""

//pour le typing
var name = ""
var lastTypingTime;
var isTyping = false;
var TYPING_TIMER_LENGTH = 1500; // ms

class App extends React.Component {
  constructor(props) 
  {
    super(props);

    this.state = 
    {
      chat: [],
      content: '/nick ',
    };
  }

  componentDidMount() 
  {
    this.socket = io(config[process.env.NODE_ENV].endpoint);

    // Lis les x derniers messages 
    this.socket.on('init', (msg, channelList) => 
    {
      console.log(channelList)
      channel = channelList[0]
      allChannel = channelList

      let msgReversed = msg.reverse();
      this.setState((state) => 
      ({
        chat: [...state.chat, ...msgReversed],
      }), 
      this.scrollToBottom);
    });


    // update le chat si un autre message est écrit
    this.socket.on(channel+'-callback', (msg) => 
    {

      this.setState((state) => 
      ({
        chat: [...state.chat, msg],
      }), 
      this.scrollToBottom);

    });

    // reception des channels disponibles
    this.socket.on('channel', (msg) => 
    {
      console.log("nouveau channel disponible:")
      console.log(msg)
      allChannel = msg;
    });

      // Whenever the server emits 'typing', show the typing message
    this.socket.on('typing', (data) => {
      // console.log("il tape sur le clavier")
      console.log(data)

      if(data.username.length != 0)
      {
        let message = ""

        for (let i = 0; i < data.username.length; i++) {
            console.log(data.username[i]);
            message += data.username[i] + ", "
        }
        message = message.substring(0, message.length - 2) + " "
        message += data.username.length > 1 ? ("sont en train d'ecrire...") : ("est en train d'ecrire...")
        let typing = document.getElementsByClassName("typing")[0]
        typing.innerText = message;
      }
      else
      {
        let typing = document.getElementsByClassName("typing")[0]
        typing.innerText = "";
      }

    });

    // Whenever the server emits 'stop typing', kill the typing message
    this.socket.on('stop typing', (data) => {
      console.log(data)
      // let typing = document.getElementsByClassName("typing")[0]
      // typing.innerText = "";

      if(data.username.length != 0)
      {
        let message = ""

        for (let i = 0; i < data.username.length; i++) {
            console.log(data.username[i]);
            message += data.username[i] + ", "
        }
  
        message = message.substring(0, message.length - 2) + " "
        message += data.username.length > 1 ? ("sont en train d'ecrire...") : ("est en train d'ecrire...")
        let typing = document.getElementsByClassName("typing")[0]
        typing.innerText = message;
      }
      else
      {
        var typing = document.getElementsByClassName("typing")[0]
        typing.innerText = "";
      }

    });
  }

  // save le message entrain d'être taper dans l'input
  handleContent(event) 
  {
      this.setState(
      {
        content: event.target.value,
      });

      this.updateTyping();
  }

  handleSubmit(event) 
  {
    // préviens le form du changement
    event.preventDefault();
    if(this.isCommand(this.socket))
    {
      console.log("commande taper")
    }
    else if(nick)
    {  
      if(!(/^(^$)|(\s+$)/.test(this.state.content)))
      {
        // envoie le message au server
        this.socket.emit(channel, {
          name: username,
          content: this.state.content,
        });

        this.displayMessage(username,this.state.content,'')
      }
      else
      {
        this.displayMessage('','',this.state.content)
      }
    }
    else
    {
      this.displayMessage("Erreur","identifiez vous avec /nick <pseudo> pour pouvoir parler",'/nick ')
    }
  }

  // Updates the typing event
  updateTyping = () => {
    if (nick) {
      if (!this.typing) {
        this.socket.emit('typing');
        isTyping = true;
      }
      lastTypingTime = (new Date()).getTime();

      setTimeout(() => {
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;

        if (timeDiff >= TYPING_TIMER_LENGTH) {
          this.socket.emit('stop typing');
          isTyping = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
  }

  isCommand(socket)
  {
    if(this.state.content.indexOf("/nick ") == 0)
    {
      if(/^[a-zA-Z0-9]+([a-zA-Z0-9](_|-)[a-zA-Z0-9])*[a-zA-Z0-9]+$/.test(this.state.content.slice(6)))
      {
        nick = true
        username = this.state.content.slice(6)
  
        // envoie le message au server
        this.socket.emit('add user', username);
  
        this.displayMessage(username,this.state.content,'')
        return true
      }
      else
      {
        this.displayMessage("Erreur","Le nom d'utilisateur n'est pas valide",'/nick ')
        return true
      }
    }
    else if(this.state.content.indexOf("/create ") == 0 && nick )
    {
      console.log("new channel: " + this.state.content.slice(8))

      if(allChannel.includes(this.state.content.slice(8)))
      {
        this.displayMessage("Creation Impossible","le channel "+ this.state.content.slice(8) +" existe déjà",'/create ')
      }
      else
      {
        this.displayMessage(username,this.state.content,'')

        // envoie le message au server
        this.socket.emit('general', {content:this.state.content });
      }

      return true
    }
    else if(this.state.content.indexOf("/join ") == 0 && nick )
    {
      console.log("join channel")

      this.channelExist(this.state.content.slice(6))
      return true
    }
    else if(this.state.content.indexOf("/quit ") == 0 && nick)
    {
      console.log("quit channel")

      this.displayMessage(username,this.state.content,'')

      channel = "general"
      return true
    }
    else
    {
      return false
    }
  }

  channelExist()
  {
    if(allChannel.includes(this.state.content.slice(6)))
    {
      console.log("channel exist")
      channel = this.state.content.slice(6)

      this.displayMessage(username,this.state.content,'')
    }
    else
    {
      console.log("ce channel n'existe pas !")
    
      this.displayMessage("Erreur","le channel spécifié n'existe pas",'')
    }
  }

  joinChannel(joinChannel)
  {
    console.log("join: " + joinChannel)

    
  }

  displayMessage(titre, message, searchBar)
  {
    this.setState((state) => {
      //met à jour le chat pour la personne actuel
      return {
        chat: [...state.chat, {
          name: titre,
          content: message,
        }],
        content: searchBar,
      };
    }, this.scrollToBottom);
  }

  // scroll le chat tout en bas
  scrollToBottom() {
    const chat = document.getElementById('chat');
    // chat.scrollTop = chat.scrollHeight;
    console.log(chat.scrollHeight)
    chat.scrollTo(0,(chat.scrollHeight+1000));
  }

  render() {
    return (
      <div className="App">

        <NavBar channel={allChannel} channelActuel={channel} className="navbar"></NavBar>

        <div className="chatInterface">

          <Paper id="chat" elevation={3}>
            {this.state.chat.map((el, index) => {
              return (
                <div key={index}>
                  <Typography variant="body2" className="name">
                    {el.name}
                  </Typography>
                  {el.content.indexOf("/img ") == 0 || el.content.indexOf("/video ") == 0 ? (
                    el.content.indexOf("/img ") == 0 ? (
                      <Typography variant="body1" className="content">
                      <a href={el.content.slice(5)} target = "_blank" ><img id="imageChat" src={el.content.slice(5)} alt="Image" style={{color:"red", borderRadius:"2%"}} ></img></a>
                      </Typography>
                    ) : (
                      <Typography variant="body1" className="content">
                      <video id="videoChat" controls muted autoplay="" loop name="media"><source src={el.content.slice(7)} alt="Video" style={{color:"red", borderRadius:"2%"}} ></source></video>
                      </Typography>
                    )
                  ) : (
                      (/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/.test(el.content)) ? (
                        <Typography variant="body1" className="content">
                          <a href={el.content} style={{color:"#1a0dab"}} target = "_blank" > {el.content}</a>
                        </Typography>
                      ) : (
                        <Typography variant="body1" className="content">
                          {el.content}
                        </Typography>
                      )
                  )}
                </div>
              );
            })}
          </Paper>
        </div> 
          <BottomBar
            content={this.state.content}
            handleContent={this.handleContent.bind(this)}
            handleSubmit={this.handleSubmit.bind(this)}
            name={username}
            typing={name}
          />
          
      </div>
    );
  }
};


export default App;
