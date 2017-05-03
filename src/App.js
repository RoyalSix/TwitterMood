import React, { Component } from 'react';
import logo from './applia_icon.png';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to Applia.io</h2>
        </div>
        <p className="App-intro">
          This website is still under construction. Please check back soon.
        </p>
      </div>
    );
  }
}

export default App;
