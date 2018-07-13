import { PluginBase } from "./PluginBase";

export class SliderPlugin extends PluginBase {
  constructor(options) {
    var defaults = {
      opacity: 0.5,
      color: "#ffffff",
      lineWidth: 2
    };
    super(defaults);
    this.setOptions(options);
    this.time = 0;
  }

  onAdd(plot) {
    var self = this;
    this._plot = plot;
    plot.on("replot", function() {
      plot.refreshPlugin(self);
    });
    //self._plot.refreshPlugin(self);
  }
  setTime(time) {
    this.time = time;
    this._plot.refreshPlugin(this);
  }
  refresh(canvas) {
    if (!this.time) {
      return;
    }
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = this.options.opacity;
    ctx.strokeStyle = this.options.color;
    ctx.lineWidth = this.options.lineWidth;
    ctx.beginPath();
    var startx = this._plot.timeToPoint(this.time);
    var top = this._plot.options.marginTopBottom;
    var bottom = canvas.height - (this._plot.options.marginTopBottom);
    ctx.moveTo(startx, top);
    ctx.lineTo(startx, bottom);
    ctx.stroke();
  }
}
