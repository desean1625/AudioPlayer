import { ControlPluginBase } from "./ControlPluginBase";
import { SelectorPlugin } from "../SelectorPlugin";
    var defaults = {
      toolTip: "Loop Audio for select area",
      icon: "<a style='font-size:25px;' >&#8619;</a>"
    };
export class LoopPlugin extends ControlPluginBase {
  constructor(options) {
    super(defaults);
    this.setOptions(options);
    this._loop = document.createElement("a");
    this.select = new SelectorPlugin();
    //select.addTo(b.plot);
    this._loop.innerHTML = this.options.icon;
    this._loop.addEventListener("click", () => {

      if (this.enabled) {
        this.select.removeFrom(this._audioPlayer.plot);
        this.enabled = false;
        this._loop.style.color = "";
        this._audioPlayer.buffer.stop();
      } else {
        this._audioPlayer.buffer.stop();
        this.select.addTo(this._audioPlayer.plot);
        this._loop.style.color = "red";
        this.enabled = true;

      }
    });
  }
  onAdd(audioPlayer) {
    this._audioPlayer = audioPlayer;
    this._audioPlayer.on("audio:stop", () => {
      if (this._audioPlayer.plot) {
        this.select.removeFrom(this._audioPlayer.plot);
        //this.select.removeFrom(this._audioPlayer.plot);
      }
      this._loop.style.color = "";
      this.enabled = false;
    });
    this.select.on("select", (e) => {
      this._audioPlayer.loop(e.start.x, e.stop.x);
    });
    return this._loop;
  }
}
LoopPlugin.mergeOptions = {
  loopButton: true,
  loopOptions:defaults
};
LoopPlugin.initHook = function() {

  if (this.options.loopButton) {
    this.addControl(new LoopPlugin());
  }
};
