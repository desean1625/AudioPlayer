import { ControlPluginBase } from "./ControlPluginBase";
export class PlayPlugin extends ControlPluginBase {
  constructor(options) {
    var defaults = {
      toolTip: "Play/Pause Audio playback",
      pause: "<a style='font-size:18px;'>&#9208;</a>",
      play: "<a style='font-size:18px;'>&#9654;</a>"
    };
    super(defaults);
    this.setOptions(options);
    this._play = document.createElement("a");
    this._play.innerHTML = this.options.play;
    this._play.addEventListener("click", () => {
      this.startPlayback();
    });
  }
  onAdd(audioPlayer) {
    this._audioPlayer = audioPlayer;
    this._audioPlayer.on("audio:stop", () => {
      this._play.innerHTML = this.options.play;
    });
    this._audioPlayer.on("audio:start", () => {
      this._play.innerHTML = this.options.pause;
    });
    return this._play;
  }
  startPlayback() {
    var buffer = this._audioPlayer.buffer;
    if (buffer) {
      if (buffer.isPlaying()) {
        this.pause = buffer.getTime();
        buffer.pause();
        //this._play.innerHTML = this.options.play;
        return;
      }
      if (!this._audioPlayer.buffer._source) {
        buffer.seek(0);
        //this._play.innerHTML = this.options.pause;
        return;
      }
      if (this.pause) {
        buffer.seek(this.pause);
        this.pause = false;
      } else {
        buffer.seek(0);
      }
    }
  }
}
PlayPlugin.mergeOptions = {
  playButton:true
};
PlayPlugin.initHook = function() {
  if (this.options.playButton) {
    this._controls.play = new PlayPlugin();
    this.addControl(this._controls.play);
  }
};
