export class AudioBuff {
  constructor(audioPlayer, buffer) {
    this.options = {
      playbackSpeed: 1
    };
    this._audioPlayer = audioPlayer;
    this._audioContext = audioPlayer.getContext();
    this._buffer = buffer; // AudioBuffer
    this._source = null; // AudioBufferSourceNode
    this._playbackTime = 0; // time of the audio playback, seconds
    this._startTimestamp = 0; // timestamp of last playback start, milliseconds
    this._isPlaying = false;
    this._bufferDuration = 0; // seconds
    this.initNewBuffer(this._buffer);
  }


  initNewBuffer(buffer) {
    this.stop();
    this._buffer = buffer;
    this._playbackTime = 0;
  }
  initSource() {
    this._source = this._audioContext.createBufferSource();
    this._source.buffer = this._buffer;
    this._source.connect(this._audioContext.destination);
    // Bind the callback to this
    var endOfPlayback = this.endOfPlayback.bind(this);
    this._source.onended = endOfPlayback;
  }
  play(start, sourceInit) {
    console.log("Play");
    start = start || 0; // when to schedule playback, 0 is immediately
    if (start < 0) {
      start = 0;
    }
    if (sourceInit) {
      this._source.start(0, start);
    } else {
      this._loop = false;
      this.initSource();
      this._source.start(0, start);
    }
    this._startTimestamp = Date.now();
    this._playbackTime = start;
    this._isPlaying = true;
    this._audioPlayer.emit("audio:start");
  }
  loop(start, stop) {
    console.log("Looping " + start + " " + stop);
    this.stop(false, true);
    if (start === stop) {
      this.play(start);
      return;
    }
    if (stop < start) {
      var tmp = start;
      start = stop;
      stop = tmp;
    }
    this.initSource();
    this._loop = true;
    this._source.loopStart = start;
    this._source.loopEnd = stop;
    this._source.loop = true;
    this.play(start, true);
  }
  seek(playbackTime) {
    if (playbackTime === undefined) {
      return;
    }
    if (playbackTime > this._buffer.duration) {
      console.log("[ERROR] Seek time is greater than duration of audio buffer.");
      return;
    }
    this.stop(); // Stop any existing playback if there is any
    this._playbackTime = playbackTime;
    this.play(); // Resume playback at new time
  }
  pause() {
    this.stop(true);
  }
  stop(pause, preventEvent) {
    if (!preventEvent) {

      this._audioPlayer.emit("audio:stop");
    }
    this._isPlaying = false; // Set to flag to endOfPlayback callback that this was set manually
    if (!this._source) {
      return;
    }
    this._source.stop(0);
    // If paused, calculate time where we stopped. Otherwise go back to beginning of playback (0).
    this._playbackTime = pause ? (Date.now() - this._startTimestamp) / 1000 + this._playbackTime : 0;
  }
  getTime() {
    //console.log(this._isPlaying)
    if (!this._isPlaying) {
      return 0;
    }
    if (this._loop && ((Date.now() - this._startTimestamp) / 1000 + this._playbackTime) > this._source.loopEnd) {
      this._startTimestamp = Date.now();
    }
    return this._isPlaying ? (Date.now() - this._startTimestamp) / 1000 + this._playbackTime : 0;
  }
  isPlaying() {
    return this._isPlaying;
  }
  endOfPlayback(endEvent) {
    console.log("end of playback");
    //this._audioPlayer.emit("audio:stop");
    // If playback stopped because end of buffer was reached
    //if (this._isPlaying) this._playbackTime = 0;
    //this._isPlaying = false;
  }

}
