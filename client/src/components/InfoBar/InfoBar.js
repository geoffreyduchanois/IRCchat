import React from 'react';

import closeIcon from '../../icons/closeIcon.png';
import shiba from '../../icons/shiba.svg';

import './InfoBar.css';

export const InfoBar = ({ room }) => (
  <div className="infoBar">
    <div className="leftInnerContainer">
      <img className="shiba1" src={shiba} alt="shiba img" />
      <h3>{room}</h3>
    </div>
    <div className="rightInnerContainer">
      <a href="/"><img src={closeIcon} alt="close icon" /></a>
    </div>
  </div>
);