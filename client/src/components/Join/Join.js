import React, { useState } from 'react';
import { Link } from "react-router-dom";

import './Join.css';
import shiba from '../../icons/shiba.svg';

export const Join = () => {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');

  return (
    <div className="joinOuterContainer">
      <div className="joinInnerContainer">
        <h1 className="heading">Doggo Chat</h1>
        <img className="shiba" src={shiba} alt="shiba img" />
        <div>
          <input placeholder="Name" className="joinInput" type="text" onChange={(event) => setName(event.target.value)} />
        </div>
        <div>
          <input placeholder="Niche" className="joinInput mt-20" type="text" onChange={(event) => setRoom(event.target.value)} />
        </div>
        <Link onClick={e => (!name || !room) ? e.preventDefault() : null} to={`/chat?name=${name}&room=${room}`}>
          <button className={'button mt-20'} type="submit">Waf WAf</button>
        </Link>
      </div>
    </div>
  );
}