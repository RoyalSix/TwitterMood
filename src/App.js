import React, { Component } from 'react';
import logo from './applia_icon.png';
import next_button from './next_button.svg';
import './App.css';
const twitterLogo = "https://upload.wikimedia.org/wikipedia/en/9/9f/Twitter_bird_logo_2012.svg";

const local = true;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      attemptedCat: null,
      tweetText: null,
      tweetSafeText: null,
      tweet: null,
      posAvg: null,
      negAvg: null,
      profileImage: null,
      userName: null,
      screenName: null,
      createdAt: null
    };
  }
  componentWillMount() {
    this.getNewTweet();
  }

  formatDate(date) {
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return date.toLocaleString("en-US", options)
  }

  trainTweetForCategory(tweet, category, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', `https://royalsix-twitter.herokuapp.com/train`, true);
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
    this.getTweetAnaylsis();
    var xhr = new XMLHttpRequest();
    xhr.open('GET', `https://royalsix-twitter.herokuapp.com/tweet`, true);
    xhr.send();
    xhr.onreadystatechange = (e) => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        const tweetObj = JSON.parse(xhr.response);
        this.setState({
          tweet: tweetObj,
          tweetText: tweetObj.text,
          tweetSafeText: tweetObj.safeText.replace(/^"(.+(?="$))"$/, '$1'),
          profileImageUrl: tweetObj.user.profile_image_url_https,
          userName: tweetObj.user.name,
          screenName: '@' + tweetObj.user.screen_name,
          createdAt: this.formatDate(new Date(tweetObj.created_at))
        })
        this.getCategory(xhr.responseText);
      }
    };
  }

  getCategory(tweet) {
    var xhr = new XMLHttpRequest();
    var encodedTweet = encodeURIComponent(tweet);
    xhr.open('GET', `https://royalsix-twitter.herokuapp.com/categorize?tweet=${encodedTweet}`, true);
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

  getTweetAnaylsis() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', `https://royalsix-twitter.herokuapp.com/analysis`, true);
    xhr.send();
    xhr.onreadystatechange = (e) => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        const tweetObj = JSON.parse(xhr.response);
        this.setState({ posAvg: parseInt(tweetObj.posAvg), negAvg: parseInt(tweetObj.negAvg) })
      }
    };
  }


  render() {
    const betterAmount = this.state.posAvg > this.state.negAvg ? "happy" : "not happy";
    const worstAmount = this.state.posAvg < this.state.negAvg ? "happy" : "not happy";
    var twitterStatement = `Users who are ${betterAmount} have ${Math.round((Math.abs(this.state.posAvg - this.state.negAvg) / Math.max(this.state.posAvg, this.state.negAvg)) * 100)}% more followers than those are ${worstAmount}`;
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to Applia.io</h2>
        </div>
        <div className="App-intro" style={{ display: 'flex', justifyContent: 'center', margin: 20, }}>
          <div style={{ flexDirection: 'column', width: 450, height: 400, borderWidth: .5, borderRadius: 5, display: 'flex', }}>
            <div style={{ display: 'flex', flexDirection: 'row', width: 'auto', margin: 15, }}>
              <img src={this.state.profileImageUrl} style={{ height: 100, width: 100, borderRadius: 5, alignSelf: 'flex-start' }} />
              <div style={{ display: "flex", flexDirection: 'column', justifyContent: 'flex-start', marginLeft: 10 }}>
                <div style={{ textAlign: 'left', fontFamily: "Helvetica Neue" }}>{this.state.userName}</div>
                <div style={{ textAlign: 'left', fontFamily: "Helvetica Neue", color: 'grey' }}>{this.state.screenName}</div>
              </div>
              <img src={twitterLogo} style={{ height: 100, width: 100, marginLeft: 'auto', paddingRight: 10 }} />
            </div>
            <div style={{ flexDirection: 'column', display: 'flex', marginLeft: 15, marginRight: 15, fontFamily: "Helvetica Neue", textAlign: 'left', }}>
              <div>{this.state.tweetSafeText}</div>
              <div style={{ paddingTop: 10, color: 'grey' }}>{this.state.createdAt}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', margin: 10, marginBottom: 5 }}>
              <div onClick={() => this.pressedButton('negative')} className={"button-select"} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: 5, width: '100%', height: 50, borderRadius: 5, outline: 0, border: 0, }}>
                <div style={{ fontFamily: "Helvetica Neue", fontWeight: 'bold' }}>NEGATIVE</div>
              </div>
              <div onClick={() => this.pressedButton('positive')} className={"button-select"} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: 5, width: '100%', height: 50, borderRadius: 5, outline: 0, border: 0, }}>
                <div style={{ fontFamily: "Helvetica Neue", fontWeight: 'bold' }}>POSITIVE</div>
              </div>
            </div>
            <div onClick={() => this.pressedButton('neutral')} className={"button-skip"} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: 15, marginTop: 0, width: 'auto', height: 50, borderRadius: 5, outline: 0, border: 0 }}>
              <div style={{ fontFamily: "Helvetica Neue", fontWeight: 'bold' }}>NEUTRAL</div>
            </div>
            <div>
            </div>
          </div>
          <img onClick={() => this.pressedButton('skip')} src={next_button} style={{ height: 70, width: 70, alignSelf: 'center', marginLeft: 20 }} />
        </div>
      </div>
    );
  }
}

export default App;

          // <img src={this.state.profileImageUrl} style={{height:30, width:30, float:'left'}}/>
          // <div>Current Tweet: </div>
          // <div>Attempted categorization: {this.state.attemptedCat.replace(/^"(.+(?="$))"$/, '$1')} </div>
          // <button style={{ margin: 5 }} onClick={() => this.pressedButton('positive')}>Positive</button>
          // <button style={{ margin: 5 }} onClick={() => this.pressedButton('negative')}>Negative</button>
          // <button style={{ margin: 5 }} onClick={() => this.pressedButton('neutral')}>Neutral</button>
          // <button style={{ margin: 5 }} onClick={() => this.pressedButton('skip')}>Skip</button>
          // <div>
          //   <p>Average of followers of users who are positive: {this.state.posAvg}</p>
          //   <p>Average of followers of users who are negative: {this.state.negAvg}</p>
          // </div>
          // <div>
          //   {twitterStatement}
          // </div>