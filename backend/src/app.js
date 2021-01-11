const express = require('express');
const app = express();
const http = require('http').Server(app);
const path = require('path');
const io = require('socket.io')(http);

const url = "mongodb+srv://root:IRCchat@cluster0.k5ug7.mongodb.net/IRCchat?retryWrites=true&w=majority";  //Moi
// const url = "mongodb+srv://admin:Password123@cluster0.6qevd.mongodb.net/irc?retryWrites=true&w=majority"   //Pa arthur
//mongodb+srv://epitechirc:epitechirc@cluster0.x2elv.mongodb.net/IRCchat?retryWrites=true&w=majority //ethan theo
const port = process.env.PORT || 8080;

const Message = require('./models/Message');
const Commande = require('./models/Commande')
const Channel = require('./models/Channel')
const mongoose = require('mongoose');

// const myMap = new Map();
const map = {}
const allChannel = ["general"]

var privateMessage = ""
var sendSameUser = ""

mongoose.connect(url, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
});

app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

let numUsers = 0;

//Recuperation channel
Channel.find().exec((erreur, channelDisponible) => {
if (erreur) return console.error(err);

for(let i = 0; i < channelDisponible.length ;i++)
{
    allChannel.push(channelDisponible[i].channel)
}

console.log(allChannel)
});

io.on('connection', (socket) => {
    let addedUser = false;

    console.log(socket.id)

    sendSameUser = socket

    //recuperer les 25 derniers messages puis les affichers
    Message.find().sort({createdAt: -1}).limit(25).exec((err, messages) => {
    if (err) return console.error(err);

    //envoyer array des messages
    socket.emit('init', messages, allChannel);
    });

    //attente nouveau message sur le channel general
    socket.on('general', (msg) => {

        privateMessage = socket;
        
        console.log(socket.id)
        console.log(map)
        if(!estCommande(msg, socket.id))
        { 

            const message = new Message({
                content: msg.content,
                name: map[socket.id],
            });

            //name: myMap.get(socket.id),

            // msg.name = myMap.get(socket.id)
            // msg.name = map[socket.id]
            // msg.name = socket.username
            console.log(msg)


            //sauvegarder message dans la basse de donnée(name + message + date)
            message.save((err) => {
                if (err) return console.error(err);
            });

            //envoyer a tous les utilisateurs le nouveau message
            socket.broadcast.emit('general-callback', msg);
        }
        else
        {
            const commande = new Commande({
                commande: msg.content,
                sender: map[socket.id],
            });

            commande.save((err) => {
                if (err) return console.error(err);
            });

            console.log(commande)
        }

        // socket.broadcast.emit('salon', allChannel);
        // console.log(map)
    });

    socket.on('nsfw', (msg) => {
        console.log("channel nsfw")
        console.log(msg)
        privateMessage = socket;
        
        console.log(socket.id)
        console.log(map)
        if(!estCommande(msg, socket.id))
        { 

            const message = new Message({
                content: msg.content,
                name: map[socket.id],
            });

            //name: myMap.get(socket.id),

            // msg.name = myMap.get(socket.id)
            // msg.name = map[socket.id]
            // msg.name = socket.username
            console.log(msg)


            //sauvegarder message dans la basse de donnée(name + message + date)
            message.save((err) => {
                if (err) return console.error(err);
            });

            //envoyer a tous les utilisateurs le nouveau message
            socket.broadcast.emit('nsfw-callback', msg);
        }
        else
        {
            const commande = new Commande({
                commande: msg.content,
                sender: map[socket.id],
            });

            commande.save((err) => {
                if (err) return console.error(err);
            });

            console.log(commande)
        }

    })

    // ajout d'une personnes
    socket.on('add user', (username) => {
        if (addedUser) return;

        // enregistre username sur la socket
        socket.username = username;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
        numUsers: numUsers
        });
        // envoyer a tous les utilisateurs qu'une nouvelle personne est connecter
        socket.broadcast.emit('user joined', {
        username: socket.username,
        numUsers: numUsers
        });
        console.log("personne "+ socket.username)
        addUser(socket.id, username)

        const commande = new Commande({
            commande: "/nick "+ username + " --> " + socket.id,
            sender: map[socket.id],
        });

        commande.save((err) => {
            if (err) return console.error(err);
        });
    });

    socket.on('disconnect', () => {
        console.log('user disconnected:' + socket.id);
        // myMap.delete(socket.id)
        console.log(map)
        delete map[socket.id]
        console.log(map)
    });
});

http.listen(port, () => {
    console.log('Ecoute sur le port: ' + port);
});


function estCommande(msg, id)
{
    // console.log(msg.content)

    //test si le message envoyer et une commande
    if(msg.content.indexOf("/create ") == 0 && UserAuthentification(map[id]))
    {
        createChannel(msg.content.slice(8), id)
        return true
    }
    // else if(msg.content.indexOf("/nick ") == 0)
    // {
    //     addUser(id, msg.content.slice(6))
    //     return true;
    // }
    else if(msg.content == "/users" && UserAuthentification(map[id]))
    {
        listUser(id)
        return true;
    }
    else if(msg.content.indexOf("/msg ")  == 0 && UserAuthentification(map[id]))
    {
        console.log("message privé")
        const params = msg.content.split(' ');

        let message = ""

        for(let i = 2; i < params.length; i++)
        {
            message += params[i] + " ";
        }

        sendMessagePrivate(map[id], params[1], message)
        return true;
    }
    else if(msg.content == "/help" && UserAuthentification(map[id]))
    {
        console.log("help: "+ id)
        helpCommand(id)
        return true;
    }
    else if(msg.content.indexOf("/") == 0 && UserAuthentification(map[id]))
    {
        console.log("erreur"+ id)

        errorCommande(id)
        return true;
    }
    else if(!UserAuthentification(map[id]))
    {
        return true
    }
    else
    {
        return false
    }
}

function UserAuthentification(id)
{
    if(id) //myMap.get(id)
    {
        return true
    }
    console.log("Non authentifier")
    return false
}

function helpCommand(id)
{
    sendSameUser.in(id).emit('general-callback', { name:"Help: ", content:"/nick <pseudo> --> S'identifier sur le chat" });
    sendSameUser.in(id).emit('general-callback', { content:"/users --> Afficher utilisateur du chat" });
    sendSameUser.in(id).emit('general-callback', { content:"/msg <pseudo> <message> --> Envoyer un message privé" });
    sendSameUser.in(id).emit('general-callback', { content:"/create <channel> --> Crée nouveau channel" });
}

function errorCommande(id)
{
    sendSameUser.in(id).emit('general-callback', { name:"help:", content:"Commande inconnue, essayez /help pour obtenir une liste de commandes"});
}

function sendMessagePrivate(emetteur, recepteur, message)
{
    console.log("emetteur: "+ emetteur)
    console.log("recepteur: "+ recepteur)
    console.log("message: "+ message)

    console.log(getKeyByValue(map,recepteur));
    privateMessage.to(getKeyByValue(map,recepteur)).emit('general-callback', { name:"Message privé de "+ emetteur, content:message});
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

function listUser(id)
{
    let users = Object.values(map)
    let message = "il y a " + users.length + " personne(s) sur le chat ("

    for (let i = 0; i < users.length; i++) {
        console.log(users[i]);
        message += users[i] + ", "
    }

    message = message.substring(0, message.length - 2) + ")"
    sendSameUser.in(id).emit('general-callback', { name:"commande /users: ", content:message});
    // sendSameUser.emit('general-callback', { name:"commande /users: ", content:message})
}

function addUser(id, name)
{
    map[id] = name
    console.log("nouvelle user " + map[id])
    // sendSameUser.broadcast.emit('general-callback', { name:"", content:"A new challenger approaches: " + name});
}


function createChannel(channel, id)
{
    console.log("creation nouveau channel:" + channel)
    
        //attente nouveau message sur le channel general
        console.log("new channel:" + channel)
        sendSameUser.join(channel)
        allChannel.push(channel)
        console.log(allChannel)

        sendSameUser.broadcast.emit('channel', allChannel);

        const addChannel = new Channel({
            channel: channel,
            creator: map[id] + "#" + id,
        });

        addChannel.save((err) => {
            if (err) return console.error(err);
        });
}