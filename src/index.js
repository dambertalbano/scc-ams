import React from 'react';
import ReactDOM from 'react-dom';
import Main from './Main'; // Assuming Main.js contains the Main component
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
