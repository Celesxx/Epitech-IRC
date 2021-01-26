import React from 'react';
import config from '../../config';
import io from 'socket.io-client';

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import BottomBar from './BottomBar.jsx';
import NavBar from './navbar.jsx';
import '../css/App.css';

import ReactPlayer from 'react-player'

var nick = false;
var username;
var channel = "..."
var allCommand = ["/img ", "/video ", "/music" , "/help" , "/list" , "/create ", "/join " , "/quit " , "/delete " , "/users" , "/msg " , "/clear"]


//audio
var notif = new Audio('https://www.myinstants.com/media/sounds/msn-sound_HSi9ogM.mp3');

//pour le typing
var name = ""
var lastTypingTime;
var isTyping = false;
var TYPING_TIMER_LENGTH = 1500; // ms

//sauvegarder commande tapé
var commande = []
var positionCommande = 0 

class App extends React.Component {
  constructor(props) 
  {
    super(props);

    this.state = 
    {
      chat: [{name: "Bienvenue sur socket.cpp :" , content: "Identifiez-vous avec le /nick <pseudo> pour pouvoir commencer à discuter" }, {name: "", content: "/img https://media.discordapp.net/attachments/766406481263591425/803189274647592960/logoBienvenue.png" }],
      content: '/nick ',
    };

    this.stateChannel = 
    {
      listChannel: []
    };
  }

  componentDidMount() 
  {
    this.socket = io(config[process.env.NODE_ENV].endpoint);

    // Lis les x derniers messages 
    this.socket.on('init', (msg, channelList) => 
    {
      // allChannel = channelList

      this.setState((stateChannel) => 
      ({
        listChannel: channelList
      }))

      let msgReversed = msg.reverse();
      this.setState((state) => 
      ({
        chat: [...state.chat, ...msgReversed],
      }), 
      this.scrollToBottom);
    });


    // update le chat si un autre message est écrit
    this.socket.on('general-callback', (msg) => 
    {
      this.setState((state) => 
      ({
        chat: [...state.chat, msg],
      }), 
      this.scrollToBottom);
      if(msg.content.indexOf("@" + username) !== -1 || msg.content.indexOf("@everyone") !== -1 )
      {
        notif.play()
      }
    });

    // reception des channels disponibles
    this.socket.on('channel', (msg) => 
    {
      // allChannel = msg;

      this.setState((stateChannel) => 
      ({
        listChannel: msg
      }))

    });

    this.socket.on('typing', (data) => {

      if(data.username.length != 0)
      {
        let message = ""

        for (let i = 0; i < data.username.length; i++) {
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

      if(data.username.length != 0)
      {
        let message = ""

        for (let i = 0; i < data.username.length; i++) {
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

    window.addEventListener('keydown', function (event)
    {
      let key = event.key;

      //teste l'input realisé
      if(key === "ArrowUp" && nick)
      {
        let input = document.getElementsByClassName("MuiInputBase-input")[0]
        input.value = commande[positionCommande];
        positionCommande <= 0 ? (positionCommande = 0) : (positionCommande--)
      }
      else if(key === "ArrowDown" && nick)
      {
        positionCommande >= commande.length - 1 ? (positionCommande = commande.length - 1) : (positionCommande++)
        let input = document.getElementsByClassName("MuiInputBase-input")[0]
        input.value = commande[positionCommande];
      }
      else if((key === "ArrowRight" || key === "Tab") && nick)
      {
        let nbSearch = 0
        let input = document.getElementsByClassName("MuiInputBase-input")[0]
        let autoCompletion = input.value
        for (let i = 0; i < allCommand.length; i++) {
            if(allCommand[i].indexOf(input.value) == 0 )
            {
                
              autoCompletion = allCommand[i]
            }
            else
            {
                nbSearch++
            }

            if(nbSearch == (allCommand.length - 1))
            {
              // console.log("nbSearch " + nbSearch)
              // console.log("allCommand.length " + allCommand.length)
              // console.log("autoCompletion " + autoCompletion)
              input.value = autoCompletion;
            }
        }
      }
    
    });
  } 

  // save le message entrain d'être taper dans l'input
  handleContent(event) 
  {
    positionCommande = commande.length - 1 //actualise la taille du tableau
    
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

    commande.push(this.state.content);
    positionCommande = commande.length - 1

    if(this.isCommand(this.socket))
    {

    }
    else if(nick)
    {  
      if(!(/^(^$)|(\s+$)/.test(this.state.content)))
      {
        // envoie le message au server
        this.socket.emit("general", {
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
      if (!(this.typing) && channel === "general") {
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
    if(this.state.content.indexOf("/nick ") === 0)
    {
      if(/^[a-zA-Z0-9]+([a-zA-Z0-9](_|-)[a-zA-Z0-9])*[a-zA-Z0-9]+$/.test(this.state.content.slice(6)))
      {
        nick = true
        username = this.state.content.slice(6)
        channel = "general"
  
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
    else if(this.state.content.indexOf("/create ") === 0 && nick )
    {
      if(this.state.listChannel.includes(this.state.content.slice(8)))
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
    else if(this.state.content.indexOf("/delete ") === 0 && nick )
    {
      if(this.state.listChannel.includes(this.state.content.slice(8)))
      {
        if(channel == this.state.content.slice(8))
        {
          channel = "general"
          this.socket.emit('general', {content:"/quit " + this.state.content.slice(8) });
          return true
        }
        else if(this.state.content.slice(8) == "general")
        {
          //Ecrit la commande dans le tchat
          this.displayMessage("Information","Impossible de supprimer le channel general",'/delete ')
          return true
        }
        else
        {
            //Ecrit la commande dans le tchat
            this.displayMessage(username,this.state.content,'')
            // envoie le message au server
            this.socket.emit('general', {content:this.state.content });
            return true
        }
      }
      else
      {
        this.displayMessage("Supression Impossible","le channel "+ this.state.content.slice(8) +" n'existe pas",'/delete ')
        return true
      }
    }
    else if(this.state.content.indexOf("/join ") === 0 && nick )
    {
      this.channelExist(this.state.content.slice(6))
      return true
    }
    else if(this.state.content.indexOf("/clear") === 0 && nick )
    {
      this.clearMessage()
      return true
    }
    else if(this.state.content.indexOf("/quit ") === 0 && nick)
    {
      this.displayMessage(username,this.state.content,'')
      
      channel = "general"
      this.socket.emit('general', {content:this.state.content });
      return true
    }
    else if(this.state.content === "jeb_")
    {
      this.rainbowEasterEgg()
      this.displayMessage("easter Egg","la rainbow c'est beau",'')
      return true
    }
    else
    {
      return false
    }
  }

  ///easter egg fessant reference a Jeb (devellopeur minecraft)
  rainbowEasterEgg()
  {
    var leftBar = document.getElementsByClassName("menu")[0]
    var bottomBar = document.getElementsByTagName("header")[0]
    var fondChat = document.getElementById("chat")

    leftBar.classList.toggle("rainbowEasterEgg");
    bottomBar.classList.toggle("rainbowEasterEgg");
    fondChat.classList.toggle("rainbowEasterEgg");
  }

  channelExist()
  {
    if(this.state.listChannel.includes(this.state.content.slice(6)))
    {
      channel = this.state.content.slice(6)
      this.setState((state) => 
      ({
        chat: [],
        content: '',
      }), 
      this.scrollToBottom);
      this.displayMessage(username,this.state.content,'')

      // envoie la commande au serveur
      this.socket.emit('general', {content:this.state.content });
    }
    else
    {    
      this.displayMessage("Erreur","le channel spécifié n'existe pas",'')
    }
  }

  clearMessage()
  {
    this.setState((state) => 
      ({
        chat: [{name:"",content:"Clear effectué avec succès"}],
        content: '',
      }), 
      this.scrollToBottom);
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
    chat.scrollTo(0,(chat.scrollHeight+1000));
  }

  render() {
    return (
      <div className="App">

        <NavBar channel={this.state.listChannel} channelActuel={channel} className="navbar"></NavBar>

        <div className="chatInterface">

          <Paper id="chat" elevation={3}>
            {this.state.chat.map((el, index) => {
              return (
                <div key={index}>
                  {el.name != "" ? (
                  <Typography variant="body2" className="name">
                    {el.name}
                  </Typography>
                  ): ("")}
                  {el.content.indexOf("/img ") === 0 || el.content.indexOf("/video ") === 0 || el.content.indexOf("/music ") === 0 ? (
                    el.content.indexOf("/img ") === 0 ? (
                      <Typography variant="body1" className="content">
                      <a href={el.content.slice(5)} target = "_blank" ><img id="imageChat" src={el.content.slice(5)} alt="Image" style={{color:"red", borderRadius:"2%"}} ></img></a>
                      </Typography>
                    ) : ( el.content.indexOf("/video ") === 0 ? (
                      <Typography variant="body1" className="content">
                        <ReactPlayer url={el.content.slice(7)}  controls pip loop="true" muted="true" playing="true"/>
                      {/* <video id="videoChat" controls muted autoplay="" loop name="media"><source src={el.content.slice(7)} alt="Video" style={{color:"red", borderRadius:"2%"}} ></source></video> */}
                      </Typography>
                      ) : (
                      <Typography variant="body1" className="content">
                        <ReactPlayer url={el.content.slice(7)} controls pip loop="true"/>
                      </Typography>
                      )
                    )
                  ) : (
                      (/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/.test(el.content)) ? (
                        <Typography variant="body1" className="content">
                          <a href={el.content} style={{color:"#1a0dab"}} target = "_blank" > {el.content}</a>
                        </Typography>
                      ) : (el.content.indexOf("@" + username) !== -1 || el.content.indexOf("@everyone") !== -1  ? (
                          (() => {
                            let text = []
                            let chaine = " " + el.content
                            const words = chaine.split(el.content.indexOf("@" + username) !== -1 ? ("@" + username) : ("@everyone"));
                            const finPhrase = words[1].split(' ')  //finPhrase[1]
                            let restePhrase = ""
                            for(let i = 1; i < finPhrase.length; i++)
                            {
                              restePhrase += " " + finPhrase[i]
                            }

                            text.push(
                            
                              <Typography variant="body1" className="content" >
                              {words[0]}
                              <strong style={{color:"#6e84d1", background:"#BECCFF", padding:"3px", borderRadius: "4px"}}>{el.content.indexOf("@" + username) !== -1 ? ("@" + username) : ("@everyone")}</strong>
                              {restePhrase}
                              </Typography>
                            
                            );

                            return text;
                          })()
                      
                      ) : (
                        el.content != "" ? (
                        <Typography variant="body1" className="content">
                          {el.content}
                        </Typography>
                        ) : ("")
                      )
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
