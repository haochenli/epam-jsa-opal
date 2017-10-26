'use strict';

import React from 'react';
import Header from '../../components/HeaderComponent';
import NavigationBar from '../../components/NavigationBarComponent';
import SuggestedVideos from '../../components/SuggestedVideosComponent';
import VideoComponent from '../../components/VideoComponent';
import './index.scss';

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      'videoLists': [],
      'clickUpload': false,
      'errorMessage': null,
      'uploading': false,
    };
    this.onClickUpload = this.onClickUpload.bind(this);
    this.onClickCancelUpload = this.onClickCancelUpload.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }
  componentDidMount() {
    this.fetchVideoLists((result) => {
      this.setState({videoLists: result});
    });
  }
  fetchVideoLists(callback) {
    fetch('/api/videos')
      .then((response) => response.json())
      .then((result) => callback(result));
  }
  onClickUpload() {
    this.setState({clickUpload: true});
  }
  onClickCancelUpload() {
    this.setState({clickUpload: false});
    this.setState({errorMessage: null});
  }
  onSubmit(ev) {
    ev.preventDefault();
    let statusCode;
    let obj = {
      url: ev.target.elements.namedItem('video-url').value || undefined,
      preview: ev.target.elements.namedItem('video-preview').value || undefined,
      title: ev.target.elements.namedItem('video-title').value || undefined,
    };

    this.setState({uploading: true});
    fetch('/api/videos', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token'),
      },
      body: JSON.stringify(obj),
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((result) => {
      if (statusCode === 200) {
        this.onClickCancelUpload();
      } else {
        this.setState({errorMessage: result.error});
      }
      this.setState({uploading: false});
    });
  }
  render() {
    return (
      <div className="homecontainer">
        <Header className="header"
          onClickUpload={this.onClickUpload}
          onClickCancelUpload={this.onClickCancelUpload}
        />
        <div className="main">
          {this.state.clickUpload ?
            <form className="upload-form" onSubmit={this.onSubmit}>
              <input type="text" name="video-url" placeholder="video url" required/>
              <input type="text" name="video-preview" placeholder="video preview" required/>
              <input type="text" name="video-title" placeholder="video title" required/>
              <button type="submit" disabled={this.state.uploading}
                className={this.state.uploading ? 'loading' : ''}>Upload</button>
              <button onClick={this.onClickCancelUpload}>Cancel</button>
              <p className="error-message">{this.state.errorMessage}</p>
            </form>
            :
            null
          }
          <NavigationBar className="navigationBar"/>
          <div className="videoComponent"> <VideoComponent defalutVideo={this.state.videoLists[0] ? this.state.videoLists[0].videoId : null}/> </div>
          <div className="suggestedVideos"> <SuggestedVideos videoLists={this.state.videoLists}/> </div>
        </div>
      </div>
    );
  }
}

export default Home;

