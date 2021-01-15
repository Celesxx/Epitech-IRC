
import React from 'react';
import { fade, makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import InputBase from '@material-ui/core/InputBase';
import Toolbar from '@material-ui/core/Toolbar';

import ChatIcon from '@material-ui/icons/Chat';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import IconButton from '@material-ui/core/IconButton';
var darktheme = false;

const useDefaultStyles = makeStyles(theme => ({
  appBar: {
    bottom: 0,
    top: 'auto',
    background: '#212121',
  },
  inputContainer: {
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    borderRadius: theme.shape.borderRadius,
    marginLeft: theme.spacing(1),
    position: 'relative',
    width: '100%',
  },
  icon: {
    width: theme.spacing(7),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
    width: "100%"
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 7),
    // transition: theme.transitions.create('width'),
    width: '100%',
    // [theme.breakpoints.up('sm')]: {
    //   width: 120,
    //   '&:focus': {
    //     width: 200,
    //   },
    // },
  },
}));

export const lightTheme = {
  body: '#FFF',
  text: '#363537',
  toggleBorder: '#FFF',
  background: '#363537',
}

export const darkTheme = {
  body: '#363537',
  text: '#FAFAFA',
  toggleBorder: '#6B8096',
  background: '#999',
}

function ChangeTheme()
{
  // if(darktheme)
  // {
  //   darktheme = false
  // }
  // else
  // {
  //   darktheme = true
  // }
  // var element = document.body;
  // // element.classList.toggle("name-dark");
  // // element.style.toggle("background-color: #202225;")

  console.log("theme")
}

export default function BottomBar(props) {
  const classes = useDefaultStyles();
  return (
    <AppBar position="fixed" className={classes.appBar}>
      <p class="typing" style={{paddingLeft:"4.3%", marginTop:"3px", fontSize:"80%", marginBottom:"-0.5%"}} >{props.typing}</p>
      <Toolbar>
        <div className={classes.inputContainer}>
            <form onSubmit={props.handleSubmit}>
            <div className={classes.icon}>
              <ChatIcon />
            </div>
            <InputBase
              onChange={props.handleContent}
              value={props.content}
              placeholder="Tapez votre message..."
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps={{ 'aria-label': 'content' }}
            />
          </form>
        </div>
        {/* <IconButton aria-label="upload picture" component="span" style={{ color: "#b9bbbe" }} onClick={() => ChangeTheme()} >
          <Brightness4Icon />
      </IconButton> */}
      </Toolbar>
    </AppBar>
  );
}
