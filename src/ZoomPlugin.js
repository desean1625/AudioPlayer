import { SelectorPlugin } from "./SelectorPlugin";
export class ZoomPlugin extends SelectorPlugin {
  constructor(options) {
    var defaults = {
      zoomInOn: "select",
      zoomOutOn: "contextmenu"
    };
    super(defaults);
    this.setOptions(options);
    this._zoom = [];
    this._currentZoom = {
      start: undefined,
      stop: undefined
    };
    this.on("select", this._handleZoomIn, this);
    this.on("cancelStart", this._handleZoomOut, this);
  }
  _handleZoomIn(e) {
    console.log(e);
    if (this._currentZoom) {
      this._zoom.push(this._currentZoom);
    }
    var start = e.start.x > e.stop.x ? e.stop : e.start;
    var stop = e.start.x < e.stop.x ? e.stop : e.start;
    this._currentZoom = {
      start: start.x,
      stop: stop.x
    };
    this._start = false;
    this._plot.plotWaveform(start.x, stop.x);
    this._plot.emit("zoom", this._currentZoom);
  }
  _handleZoomOut(e) {
    this._start = false;
    e.originalEvent.preventDefault();
    if (!this._currentZoom.start) {
      return;
    }
    var level = this._zoom.pop() || {
      start: undefined,
      stop: undefined
    };
    this._plot.plotWaveform(level.start, level.stop);
    this._currentZoom = level;
    this._plot.emit("zoom", this._currentZoom);
  }
}
