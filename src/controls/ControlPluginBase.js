import { PluginBase } from "../PluginBase";
export class ControlPluginBase extends PluginBase {
  constructor(options) {
    var defaults = {
      toolTip: "Genric audio control"
    };
    super(defaults);
    this.setOptions(options);
  }
  onAdd(audioPlayer) {
    console.log("Abstract onAdd Method returns button or slider for the control bar");
  }
}
