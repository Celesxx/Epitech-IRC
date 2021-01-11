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

class App extends React.Component {
  constructor(props) 
  {
    super(props);

    this.state = 
    {
      chat: [],
      content: '',
      name: '',
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

  }

  // save le message entrain d'être taper dans l'input
  handleContent(event) 
  {
      this.setState(
      {
        content: event.target.value,
      });
      // console.log("en train de taper")
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
      // envoie le message au server
      this.socket.emit(channel, {
        name: username,
        content: this.state.content,
      });

      this.displayMessage(username,this.state.content,'')
    }
    else
    {
      this.displayMessage("Erreur","identifiez vous avec /nick <pseudo> pour pouvoir parler",'/nick ')
    }
  }

  isCommand(socket)
  {
    if(this.state.content.indexOf("/nick ") == 0)
    {
      nick = true
      username = this.state.content.slice(6)

      // envoie le message au server
      this.socket.emit('add user', username);

      this.displayMessage(username,this.state.content,'')
      return true
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

  // Always make sure the window is scrolled down to the last message.
  scrollToBottom() {
    const chat = document.getElementById('chat');
    chat.scrollTop = chat.scrollHeight;
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
                  <Typography variant="caption" className="name">
                    {el.name}
                  </Typography>
                  <Typography variant="body1" className="content">
                    {el.content}
                  </Typography>
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
          />
          
      </div>
    );
  }
};

export default App;
