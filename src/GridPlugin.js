import { PluginBase } from "./PluginBase";

export class GridPlugin extends PluginBase {
  constructor(options) {
    var defaults = {
      borderStyle: {
        opacity: 0.5,
        color: "#ffffff",
        lineWidth: 2
      },
      gridStyle: {
        opacity: 0.5,
        color: "#ffffff",
        lineWidth: 1
      },
      font: {
        size: 10,
        font: "sans-serif",
        color: "white"
      }
    };
    super(defaults);
    this.setOptions(options);
  }

  onAdd(plot) {
    var self = this;
    this._plot = plot;
    plot.on("replot", function() {
      plot.refreshPlugin(self);
    });
    //self._plot.refreshPlugin(self);
  }
  refresh(canvas) {
    console.log(this.options);
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = this.options.borderStyle.opacity;
    ctx.strokeStyle = this.options.borderStyle.color;
    ctx.lineWidth = this.options.borderStyle.lineWidth;
    ctx.beginPath();
    var startx = this._plot.options.marginLeftRight;
    var stopx = this._plot._canvas.width - this._plot.options.marginLeftRight;
    var top = this._plot.options.marginTopBottom;
    var bottom = canvas.height - (this._plot.options.marginTopBottom);
    ctx.moveTo(startx, top);
    ctx.lineTo(stopx, top);
    ctx.lineTo(stopx, bottom);
    ctx.lineTo(startx, bottom);
    ctx.lineTo(startx, top);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = this.options.font.color;
    ctx.font = this.options.font.size + "px " + this.options.font.font;
    var step = (this._plot.xstop - this._plot.xstart) * 0.1;
    var point = this._plot.timeToPoint(this._plot.xstart);
    ctx.fillText(this._plot.xstart.toFixed(3), point, bottom + 10);
    var start = this._plot.xstart + step;
    for (var i = start, n = this._plot.xstop; i < n;) {
      ctx.globalAlpha = this.options.gridStyle.opacity;
      ctx.strokeStyle = this.options.gridStyle.color;
      ctx.lineWidth = this.options.gridStyle.lineWidth;
      ctx.setLineDash([3, 3]);
      point = ~~(this._plot.timeToPoint(i));
      ctx.beginPath();
      ctx.moveTo(point, top);
      ctx.lineTo(point, bottom);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillText(i.toFixed(3), point, bottom + 10);
      i += step;
    }
    if (!this._plot.xstop) {
      return;
    }
    var fontOffset = ((this._plot.xstop.toFixed(3).toString().length + 0.3) * this.options.font.size) / 2;
    //ctx.fillText(this._plot.xstart.toFixed(3), startx, bottom +10);
    ctx.beginPath();
    ctx.moveTo(startx, top);
    ctx.lineTo(stopx, bottom);
    ctx.fillText(this._plot.xstop.toFixed(3), stopx - fontOffset, bottom + 10);
  }
}
