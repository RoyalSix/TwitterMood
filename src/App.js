import React, { Component } from 'react';
import logo from './applia_icon.png';
import './App.css';
var Twit = require('twit');
var _ = require('lodash');
var bayes = require('bayes');
var classifier = bayes();
var request = require('request');

const IP = "localhost"

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      attemptedCat: "Loading",
      tweetText: "Loading Tweet",
      tweet: null
    };
  }
  componentWillMount() {
    this.getNewTweet();
  }

  trainTweetForCategory(tweet, category, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', `http://${IP}:8080/train`, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    var stringTweet = encodeURIComponent(JSON.stringify(this.state.tweet));
    xhr.send(`tweet=${stringTweet}&category=${category}`);
    xhr.onreadystatechange = (e) => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        callback();
      } else callback(e || "ERROR");
    };
  }

  getNewTweet() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', `http://${IP}:8080/tweet`, true);
    xhr.send();
    xhr.onreadystatechange = (e) => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        const tweetObj = JSON.parse(xhr.response);
        this.setState({ tweet: tweetObj, tweetText: tweetObj.text })
        this.getCategory(xhr.responseText);
      }
    };
  }

  getCategory(tweet) {
    var xhr = new XMLHttpRequest();
    var encodedTweet = encodeURIComponent(tweet);
    xhr.open('GET', `http://${IP}:8080/categorize?tweet=${encodedTweet}`, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send();
    xhr.onreadystatechange = (e) => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        this.setState({ attemptedCat: xhr.responseText });
      }
    };
  }

  pressedButton(input) {
    if (!input) return this.getNewTweet();
    this.trainTweetForCategory(this.state.tweetText, input, (err) => {
      if (!err) {
        this.getNewTweet();
      }
    })
  }


  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to Applia.io</h2>
        </div>
        <p className="App-intro">
          <div>Current Tweet: {this.state.tweetText.replace(/^"(.+(?="$))"$/, '$1')}</div>
          <div>Attempted categorization: {this.state.attemptedCat.replace(/^"(.+(?="$))"$/, '$1')} </div>
          <button onClick={() => this.pressedButton('p')}>Positive</button>
          <button onClick={() => this.pressedButton('n')}>Negative</button>
          <button onClick={() => this.pressedButton()}>Skip</button>
        </p>
      </div>
    );
  }
}

export default App;
