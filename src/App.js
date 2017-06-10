import React, { Component } from 'react';
import logo from './applia_icon.png';
import next_button from './next_button.svg';
import reload from './reload.svg'
import './App.css';
const twitterLogo = "https://upload.wikimedia.org/wikipedia/en/9/9f/Twitter_bird_logo_2012.svg";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      attemptedCat: "positive",
      tweetText: null,
      tweetSafeText: `This is tweet about something. 
      Your job is to decide whether or not the tweet is referring to something positive or negative.`,
      tweet: null,
      posAvg: 2039,
      negAvg: 3190,
      profileImage: null,
      userName: "Jay Scott",
      screenName: "@RoyalSix",
      createdAt: this.formatDate(new Date("Sat Jun 10 2017 12:07:39 GMT-0400 (EDT)")),
      location: "USA",
      buttonChange: false
    };
    this.changeButtons = this.changeButtons.bind(this);
  }
  componentWillMount() {
    this.getNewTweet();
  }

  formatDate(date) {
    var options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
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
        this.setState({ attemptedCat: xhr.responseText.replace(/^"(.+(?="$))"$/, '$1') });
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

  changeButtons() {
    this.setState({
      buttonChange: !this.state.buttonChange
    })
  }


  render() {
    const betterAmount = this.state.posAvg > this.state.negAvg ? "happy" : "not happy";
    const worstAmount = this.state.posAvg < this.state.negAvg ? "happy" : "not happy";
    var twitterStatement = `Users who are ${betterAmount} have ${Math.round((Math.abs(this.state.posAvg - this.state.negAvg) / Math.max(this.state.posAvg, this.state.negAvg)) * 100)}% more followers than those are ${worstAmount}`;
    const buttonBackgroundColor = this.state.attemptedCat == 'positive' ? 'lightgreen' : this.state.attemptedCat == 'neutral' ? 'lightgrey' : 'lightcoral';
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to Applia.io</h2>
        </div>
        <div className="App-intro" style={{ display: 'flex', justifyContent: 'center', margin: 20, }}>
          <div style={{ flexDirection: 'column', width: 600, height: 'auto', borderWidth: .5, borderRadius: 5, display: 'flex', }}>
            <TweetTop {...this.state} />
            <div style={{ flexDirection: 'column', display: 'flex', marginLeft: 15, marginRight: 15, fontFamily: "Helvetica Neue", textAlign: 'left', }}>
              <div>{this.state.tweetSafeText}</div>
            </div>
            {!this.state.buttonChange ?
              <ClassificationButtons attemptedCat={this.state.attemptedCat} changeButtons={this.changeButtons} buttonBackgroundColor={buttonBackgroundColor} /> :
              <ClassificationButtonsChange changeClassification={(classification) => this.setState({ attemptedCat: classification, buttonChange: !this.state.buttonChange })} />
            }
          </div>
      <div style={{ display: 'flex', flexDirection:'column', justifyContent:'space-around' }}>
          <img onClick={() => this.pressedButton(this.state.attemptedCat)} src={next_button} style={{ height: 70, width: 70, alignSelf: 'center', marginLeft: 20 }} />
           <img onClick={() => this.pressedButton()} src={reload} style={{ height: 70, width: 70, alignSelf: 'center', marginLeft: 20 }} />
           </div>
        </div>
      </div>
    );
  }
}

export class ClassificationButtons extends Component {
  render() {
    return (
      <div style={{ display: 'flex', margin: 15, height: 100, borderRadius: 5, justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ justifyContent: 'center', alignItems: 'center', display: 'flex', fontFamily: "Helvetica Neue", width: '100%', borderRightWidth: 1, borderRightStyle: 'solid', borderRightColor: 'black', height: '100%', backgroundColor: '#3cf' }}>
          <div style={{ fontSize: 22, fontWeight: 'bold' }}>
            CLASSIFICATION:
                </div>
        </div>
        <div style={{ height: '100%', backgroundColor: this.props.buttonBackgroundColor, justifyContent: 'center', alignItems: 'center', display: 'flex', fontFamily: "Helvetica Neue", width: '100%', }}>
          <div style={{ fontSize: 22, fontWeight: 'bold' }}>
            {this.props.attemptedCat.toUpperCase()}
            <div className={"link"} onClick={this.props.changeButtons} style={{ fontSize: 12, fontWeight: 'normal' }}>Click to change</div>
          </div>
        </div>
      </div>
    );
  }
}

export class ClassificationButtonsChange extends Component {
  render() {
    return (
      <div style={{ display: 'flex', margin: 15, height: 100, borderRadius: 5, justifyContent: 'center', alignItems: 'center' }}>
        <div onClick={() => this.props.changeClassification('negative')} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', backgroundColor: 'lightcoral', borderRadius: 5 }}>
          <div style={{ fontSize: 22, fontWeight: 'bold', fontFamily: "Helvetica Neue" }}>
            NEGATIVE
          </div>
        </div>
        <div onClick={() => this.props.changeClassification('positive')} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', backgroundColor: 'lightgreen', marginLeft: 15, marginRight: 10, borderRadius: 5 }}>
          <div style={{ fontSize: 22, fontWeight: 'bold', fontFamily: "Helvetica Neue" }}>
            POSITIVE
          </div>
        </div>
        <div onClick={() => this.props.changeClassification('neutral')} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', backgroundColor: 'lightgrey', borderRadius: 5 }}>
          <div style={{ fontSize: 22, fontWeight: 'bold', fontFamily: "Helvetica Neue" }}>
            NEUTRAL
          </div>
        </div>
      </div>
    );
  }
}

export class TweetTop extends Component {
  render() {
    return (
      <div style={{ display: 'flex', margin: 15, justifyContent: 'center' }}>
        <img src={this.props.profileImageUrl} style={{ height: 100, width: 100, borderRadius: 5, }} />
        <div style={{ display: "flex", flexDirection: 'column', marginLeft: 'auto', justifyContent: 'center' }}>
          <div>
            <div style={{ fontFamily: "Helvetica Neue" }}>{this.props.userName}</div>
            <div style={{ fontFamily: "Helvetica Neue", color: 'grey' }}>{this.props.screenName}</div>
          </div>
          <div style={{ display: 'flex', }}>
            <div style={{ color: 'grey', margin: 5, fontSize: 15 }}>{this.props.createdAt}</div>
            <div style={{ color: 'grey', margin: 5, fontSize: 15 }}>{this.props.location}</div>
          </div>
        </div>
          <img src={twitterLogo} style={{ height: 100, width: 100, marginLeft: 'auto', paddingRight: 10 }} />
      </div>
    )
  }
}

export default App;

            //         <div style={{ display: 'flex', justifyContent: 'center', margin: 10, marginBottom: 5 }}>
            //   <div onClick={() => this.pressedButton('negative')} className={"button-select"} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: 5, width: '100%', height: 50, borderRadius: 5, outline: 0, border: 0, }}>
            //     <div style={{ fontFamily: "Helvetica Neue", fontWeight: 'bold' }}>NEGATIVE</div>
            //   </div>
            //   <div onClick={() => this.pressedButton('positive')} className={"button-select"} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: 5, width: '100%', height: 50, borderRadius: 5, outline: 0, border: 0, }}>
            //     <div style={{ fontFamily: "Helvetica Neue", fontWeight: 'bold' }}>POSITIVE</div>
            //   </div>
            // </div>
            // <div onClick={() => this.pressedButton('neutral')} className={"button-skip"} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: 15, marginTop: 0, width: 'auto', height: 50, borderRadius: 5, outline: 0, border: 0 }}>
            //   <div style={{ fontFamily: "Helvetica Neue", fontWeight: 'bold' }}>NEUTRAL</div>
            // </div>

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
          //<div style={{ color: 'grey' }}>{this.state.createdAt}</div>