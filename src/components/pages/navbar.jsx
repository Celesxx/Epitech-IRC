// import logo from '../img/logo.svg';
import React from "react";
import '../css/navbar.css';
import { Link } from "react-router-dom";

let NavBar
export default NavBar = ({channel,channelActuel}) => {

  // render ()
  {
    return(

      <div>
        <div class="area"></div>
        <nav class="menu">
                <ul>
                    <li>
                        <a>
                            <i class="fa fa-home fa-2x"></i>
                            <span class="nav-text">
                            <Link to="/">{channelActuel}</Link>
                            </span>
                        </a>
                    </li>
                    {(() => {
                      const channelDispo = [];

                      for (let i = 0; i < channel.length; i++) {
                        channelDispo.push(
                          channel[i] != channelActuel ? ( <li><a><i class="fa fa-pencil fa-2x"></i><span class="nav-text"> {channel[i]}</span></a></li> ) : ("")
                        )
                      }

                      return channelDispo;
                      })()}
                </ul>
            </nav>
      </div>
    )

  }
}

// export default index;
