import React, { Component } from 'react';
import logo from './applia_icon.png';
import './App.css';
var Twit = require('twit');
var _ = require('lodash');
var bayes = require('bayes');
var classifier = bayes();
var request = require('request');
// const TWITTER_CONSUMER_KEY = "toMMj1XMujQ2rD7b4gAWXmeZ0";
// const TWITTER_CONSUMER_SECRET = "m1pREGK1EgXJiminqpklGgOIoWhaISYw5FLXkdvZRrhcEby54w";
// const TWITTER_ACCESS_TOKEN =  "354504507-98WaGRfkAxcnb4ECiV35bdXPa9ebKJpqm0Bg8OsT";
// const TWITTER_ACCESS_TOKEN_SECRET = "fgdyrMh1Q4ZXdmVRYiDtixgUn6RuUDGskVw9UEnHpysON";

// var twitter = new Twit({
//   consumer_key: TWITTER_CONSUMER_KEY,
//   consumer_secret: TWITTER_CONSUMER_SECRET,
//   access_token: TWITTER_ACCESS_TOKEN,
//   access_token_secret: TWITTER_ACCESS_TOKEN_SECRET
// });
// var testRegex = '(.*I had.*|.*(I am))|(.*( day).*)|(.*( feel).*)|(I.*now|.*I)';
// var tweetStream = twitter.stream('statuses/filter', { track: ['I'], language: 'en' });

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      attemptedCat: "Loading",
      done: true,
      tweet: "Loading Tweet",
      tweetText: "Loading Tweet",
      tweetsArray: []
    };
  }
  componentWillMount() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', "http://35.187.165.232:8080/tweet", true);
    xhr.send();
    xhr.onreadystatechange = (e) => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        this.setState({tweetText:xhr.responseText})
      }
    };
  }
  trainData() {
    this.setState({ done: false })
    if (this.state.tweetsArray) {
      const tweet = this.state.tweetsArray[0];
      var tweetText = tweet.extended_tweet ? tweet.extended_tweet.full_text : tweet.retweeted_status ? tweet.retweeted_status.text : tweet.text;
      tweetText = tweetText.replace(/(http.+(\S|\b|\n))/g, '').trim();
      var attemptedCat = classifier.categorize(tweetText);
      this.setState({
        tweetText: tweetText,
        attemptedCat: attemptedCat,
        tweet: tweet
      })
    }
  }

  pressedButton(input) {
    debugger;
    const currentArrayOfTweets = this.state.tweetsArray.splice(0);
    if (input == "p") classifier.learn(this.state.tweetText, 'positive');
    else if (input == "n") classifier.learn(this.state.tweetText, 'negative');
    var stateJson = classifier.toJson();
    input = input || "neu";
    //if (input != "neu") followersData[input].push({ followers: tweet.user.followers_count, username: tweet.user.screen_name })
    try {
      //fs.writeJSONSync('./bayesData.json', stateJson)
      //fs.writeJSONSync('./followersData.json', followersData)
    } catch (e) {
      console.log(e);
    }
    this.done = true;
    if (currentArrayOfTweets.length > 0) {
      currentArrayOfTweets.shift();
      this.setState({ tweetsArray: currentArrayOfTweets })
      this.trainData();
    }
  }
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to Applia.io</h2>
        </div>
        <p className="App-intro">
          <div>Current Tweet: {this.state.tweetText}</div>
          <div>Attempted categorization: {this.state.attemptedCat} </div>
          <button onClick={() => this.pressedButton('p')}>Positive</button>
          <button onClick={() => this.pressedButton('n')}>Negative</button>
        </p>
      </div>
    );
  }
}

export default App;
