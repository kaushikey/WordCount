// src/Card.js
import React from 'react';

function Card({ title, content }) {
  return (
    <div className="card" style={cardStyle}>
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        <p className="card-text">{content}</p>
      </div>
    </div>
  );
}

const cardStyle = {
  width: '7rem',
  margin: '10px',
  border: '1px solid #ccc', // Border style
  backgroundColor: '#f5f5f5', // Grey background color
  display: 'inline-block', // Display cards horizontally
};

export default Card;
