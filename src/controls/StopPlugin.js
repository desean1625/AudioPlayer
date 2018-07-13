import { ControlPluginBase } from "./ControlPluginBase";
export class StopPlugin extends ControlPluginBase {
  constructor(options) {
    var defaults = {
      toolTip: "Stop Audio playback",
      stop: "<a style='font-size:25px;'>&#9632;</a>"
    };
    super(defaults);
    this.setOptions(options);
    this._stop = document.createElement("a");
    this._stop.innerHTML = this.options.stop;
    this._stop.addEventListener("click", () => {
      this._audioPlayer.buffer.stop();
    });
  }
  onAdd(audioPlayer) {
    this._audioPlayer = audioPlayer;
    return this._stop;
  }
}
StopPlugin.mergeOptions = {
  stopButton: true
};
StopPlugin.initHook = function() {

  if (this.options.stopButton) {
    this.addControl(new StopPlugin());
  }
};
