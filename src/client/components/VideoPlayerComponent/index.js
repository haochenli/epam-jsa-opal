import React from 'react';
import './index.scss';

class VideoPlayer extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <video controls
        src="http://nettuts.s3.amazonaws.com/763_sammyJSIntro/trailer_test.mp4" type="video/mp4"
      />
    );
  }
}

export default VideoPlayer;

