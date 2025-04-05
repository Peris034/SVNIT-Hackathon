<<<<<<< HEAD
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Toaster } from 'react-hot-toast';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
=======
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import React from 'react'
createRoot(document.getElementById('root')).render(
  <StrictMode>
>>>>>>> 3c40666 (Dependenciesy added)
    <App />
    <Toaster />
  </React.StrictMode>
);