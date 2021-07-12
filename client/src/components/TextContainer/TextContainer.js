import React from 'react';

import onlineIcon from '../../icons/onlineIcon.png';

import './TextContainer.css';




export const TextContainer = ({ users }) => (
  <div className='textContainer'>
    {users ? (
      <div>
        <h1>Users chatting</h1>
        <div className='activeContainer'>
          <h2>
            {users.map(({ name }) => (
              <div key={name} className='activeItem'>
                {name}
                <img alt='Online Icon' src={onlineIcon} />
              </div>
            ))}
          </h2>
        </div>
        <h1>Room online</h1>
        <div className='activeContainer'>
          <h2>
            {users.map(({ room }) => (
              <div key={room} className='activeItem'>
                <button class='bouton'>{room}</button>
                <img alt='Online Icon' src={onlineIcon} />
              </div>
            ))}
          </h2>
        </div>
      </div>
    ) : null}
  </div>  
);

