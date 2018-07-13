import { PluginBase } from "./PluginBase";
import { Plot } from "./Plot";
export class SelectorPlugin extends PluginBase {
  constructor(options) {
    var defaults = {
      fillStyle: {
        opacity: 0.4,
        color: "rgb(60%,60%,55%)"
      },
      edgeStyle: {
        lineWidth: 1,
        lineCap: "square",
        color: "white"
      },
      mouseButton: Plot.Mouse.LEFTCLICK,
      removeOnSelect: true
    };
    super(defaults);
    this.setOptions(options);
  }
  onRemove(plot) {
    var self = this;
    console.log("ON REMOVE");
    plot.off("mousedown", self._handleMouseDown, self);
    plot.off("mousemove", self._handleMouseMove, self);
    plot.off("mouseup", self._handleMouseUp, self);
  }
  _handleMouseMove(e) {
    var self = this;
    if (!self._start) {
      return;
    }
    self._stop = e;
    self._plot.refreshPlugin(self);
  }
  _handleMouseDown(e) {
    var self = this;
    console.log(e);
    if (e.originalEvent.which === self.options.mouseButton) {
      self.emit("startSelect", e);
      self._start = e;
    } else {
      self.emit("cancelStart", e);
    }
  }
  _handleMouseUp(e) {
    var self = this;
    if (!self._start) {
      return;
    }
    if (e.originalEvent.which !== self.options.mouseButton) {
      return;
    }
    if (self._start.x !== e.x) {
      self.emit("select", {
        start: self._start,
        stop: e
      });
      self._plot.refreshPlugin(self);
    }
    self._start = false;
  }
  onAdd(plot) {
    var self = this;
    this._plot = plot;
    plot.on("mousedown", self._handleMouseDown, self);
    plot.on("mousemove", self._handleMouseMove, self);
    plot.on("mouseup", self._handleMouseUp, self);
  }
  refresh(canvas) {
    var ctx = canvas.getContext("2d");
    if (this.options.removeOnSelect) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (!this._start) {
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = this.options.fillStyle.opacity;
    ctx.fillStyle = this.options.fillStyle.color;
    ctx.lineCap = this.options.edgeStyle.lineCap;
    ctx.strokeStyle = this.options.edgeStyle.color;
    ctx.beginPath();
    var start = this._start.originalEvent.offsetX + 0.5;
    var stop = this._stop.originalEvent.offsetX + 0.5;
    var top = this._plot.options.marginTopBottom;
    var bottom = canvas.height - (this._plot.options.marginTopBottom * 2);
    ctx.moveTo(start, top);
    ctx.lineTo(start, bottom + this._plot.options.marginTopBottom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(stop, top);
    ctx.lineTo(stop, bottom + this._plot.options.marginTopBottom);
    ctx.stroke();
    ctx.fillRect(start, top, stop - start, bottom);
  }
}
