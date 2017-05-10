import React, { Component } from 'react';
import logo from './applia_icon.png';
import './App.css';

class App extends Component {
  componentWillMount() {
  }
  onClick() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://35.187.165.232/testpost.php");
    xhr.send({});
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          console.log(xhr.responseText);
        }
      }
    };
  }
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
        <button onClick={this.onClick}>
        </button>
      </div>
    );
  }
}

export default App;
