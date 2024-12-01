import React from 'react';
import "./CSS/Catalog.css";

const Item = ({ kind, artistName, trackName, artworkUrl100, trackId}) => (
  // <a href={"/catalog/" + trackId}>
  <div className="card">
    <div>{kind}</div>
    <div className="card-text">{artistName}</div>
    <div className="card-text">{trackName}</div>
    <div>
      <img src={artworkUrl100} alt={trackName} />
    </div>
  </div>
  // </a>
);


export default Item;
