// import logo from '../img/logo.svg';
import React from "react";
import '../css/navbar.css';
import { Link } from "react-router-dom";

let NavBar
export default NavBar = ({channel,channelActuel}) => {

  // render ()
  {
    return(
      channel != null ? (
      <div>
        <div class="area"></div>
        <nav class="menu">
                <ul>
                {(() => {
                    const channel = [];

                    for (let i = 0; i < channelActuel.length; i++) {
                      channel.push(
                        <li>
                          <a>
                              <i class="fa fa-home fa-2x"></i>
                              <span class="nav-text">
                              <Link to="/">{channelActuel[i]}</Link>
                              </span>
                          </a>
                      </li>
                        );
                    }

                    return channel;
                    })()}

                    {(() => {
                      const channelDispo = [];
                      for (let i = 0; i < channel.length; i++) {
                        let existe = false;
                        for (let j = 0; j < channelActuel.length; j++) {
                            if(channel[i] == channelActuel[j])
                            {
                              existe = true
                            }
                        }

                        channelDispo.push(
                          existe ? ("") : (<li><a><i class="fa fa-pencil fa-2x"></i><span class="nav-text"> {channel[i]}</span></a></li>)
                        )
                      }

                      return channelDispo;
                      })()}
                </ul>
            </nav>
      </div>
      ) : ("")
    )

  }
}

// export default index;
