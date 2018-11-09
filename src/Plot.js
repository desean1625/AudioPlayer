/* global window */
/* global module */
/* global require */
/* global AudioContext */
/* global console */
"use strict";
import { PluginBase } from "./PluginBase";
import * as EventEmitter from "eventemitter3";
import workerScript from '!raw-loader!./plot-worker.js'

var PLOT_WAVEFORM_BREAKTIME = 1000;
var RENDER_OFF_SCREEN = 'OffscreenCanvas' in window;
export class Plot extends EventEmitter {
  constructor(container, options) {
    super();
    var self = this;
    this.options = Plot.defaults;
    if (RENDER_OFF_SCREEN) {
      const blob = new Blob([workerScript], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      this.worker = new Worker(url);
      this.worker.onmessage = (e) => {
        if (e.data.msg === "setVars") {
          for (let prop in e.data.vars) {
            this[prop] = e.data.vars[prop];
          }
        } else {
          console.log(...e.data);
          this.emit(...e.data);
        }
      }
    }
    this.setOptions(options);
    this._plugins = [];
    self.xstart = 0;
    self.xstop = 1;
    self.yratio = 1;
    self._data = [];
    this._container = container;
    this._container.innerHtml = "";
    container.style.backgroundColor = this.options.backgroundColor;
    this._canvas = document.createElement("canvas");
    this._pluginCanvas = document.createElement("canvas");
    this._pluginsCtx = this._pluginCanvas.getContext("2d");
    this._container.innerText = "";
    this._container.append(this._canvas);
    this._container.style.position = "relative";
    this.ctx = this._canvas.getContext("2d");
    if (RENDER_OFF_SCREEN) {
      var offScreenCanvas = document.createElement("canvas");
      offScreenCanvas.style.position = "absolute";
      offScreenCanvas.style.top = "0px";
      offScreenCanvas.style.left = "0px";
      offScreenCanvas.style.pointerEvents = "none";
      this._container.append(offScreenCanvas);
      offScreenCanvas = offScreenCanvas.transferControlToOffscreen();
      this.worker.postMessage({ msg: 'setCanvas', canvas: offScreenCanvas }, [offScreenCanvas]);
    }
    this._untaintedCanvas = document.createElement("canvas");
    this._untaintedCanvasCTX = this._untaintedCanvas.getContext("2d");
    this._resize();
    this._setupPlotListeners();
  }

  _resize() {
    var width = this._container.offsetWidth;
    var height = this._container.offsetHeight;
    if (RENDER_OFF_SCREEN) {
      this.worker.postMessage({ msg: 'resize', width: width, height: height });
    }
    this._canvas.width = width;
    this._canvas.height = height;
    this._untaintedCanvas.width = width;
    this._untaintedCanvas.height = height;
    this._pluginCanvas.width = width;
    this._pluginCanvas.height = height;
    this.refreshPlugin();
    if (width && height) {
      requestAnimationFrame(() => {
        this.plotWaveform(this.xstart, this.xstart);
      });

    }
  }
  _setupPlotListeners() {
    var self = this;

    self.on("replot", function() {
      self.refreshPlugin();
    });
    var events = ["click", "mousedown", "mousemove", "mouseup"];
    window.addEventListener("resize", function() {
      if (self._resizeTimer) {
        clearTimeout(self._resizeTimer);
      }
      self._resizeTimer = setTimeout(function() {
        self._resize();
      }, 100);
    });
    events.forEach(function(event) {
      self._canvas.addEventListener(event, function(e) {
        var y = e.offsetY * self.yratio;
        self.emit(event, {
          x: self.pointToTime(e.offsetX),
          y: y,
          originalEvent: e
        });
      });
    });
    self._canvas.addEventListener("contextmenu", function(e) {
      e.preventDefault();
      var y = e.offsetY * self.yratio;
      self.emit(event, {
        x: self.pointToTime(e.offsetX),
        y: y,
        originalEvent: e
      });
    });
    self.on("mousedown", function(e) {
      self._selection = e;
    });
    self.on("mouseup", function(e) {
      if (!self._selection) {
        return;
      }
      if (self._selection.x !== e.x) {
        var start = self._selection.x < e.x ? self._selection : e;
        var stop = self._selection.x > e.x ? self._selection : e;
        self.emit("select", {
          start: start,
          stop: stop
        });
        self._selection = false;
      }
    });
  }
  timeToPoint(time) {
    var self = this;
    var width = self._canvas.width - (self.options.marginLeftRight * 2);
    var offset = (time - self.xstart) / (self.xstop - self.xstart);
    return width * (offset) + self.options.marginLeftRight;
  }
  pointToTime(x) {
    var self = this;
    var offset = (self.xstop - self.xstart) / (self._canvas.width - (self.options.marginLeftRight * 2));
    return (x - self.options.marginLeftRight) * offset + self.xstart;
  }
  setOptions(options) {
    Object.assign(this.options, options);
    if (RENDER_OFF_SCREEN) {
      this.worker.postMessage({ msg: "setOptions", options: JSON.parse(JSON.stringify(this.options)) });
    }
  }
  async plotWaveform(start, stop) {
    if (RENDER_OFF_SCREEN) {
      this.worker.postMessage({
        msg: 'plotWaveform',
        start: start,
        stop: stop
      });
      return;
    }
    let pstart = performance.now();
    this._currentDraw = pstart;
    if (this._canvas.width === 0) {
      return; //No point in working if we cant see the canvas
    }
    if (stop < start) {
      throw new Error("Start must be greater than stop");
    }
    start = start || 0;
    stop = stop || (this._data.length / 2) / this.sampleRate;
    var plotHeight, ptY, ptX, pt, data;
    start = ~~(start * this.sampleRate) * 2;
    if (start < 0) {
      start = 0;
    }
    stop = ~~(stop * this.sampleRate) * 2;
    if (stop > this._data.length) {
      stop = 0;
    }
    this.ctx.fillStyle = this.options.backgroundColor;
    this.ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
    console.log("Plot start draw", start, stop);
    if (start === stop) {
      this._untaintedCanvasCTX.drawImage(this._canvas, 0, 0);
      this.emit("replot");
      return;
    }
    this.emit("replot:start");
    data = this._data; //.slice(start, stop);

    //console.log("start/stop", start, stop);
    let abs = this._abs;
    plotHeight = ((this._canvas.height - (this.options.marginTopBottom * 2)) / 2); //- this.options.marginTopBottom - this.options.marginTopBottom;
    let plotWidth = (this._canvas.width - (this.options.marginLeftRight * 2)); //- this.options.marginLeftRight - this.options.marginLeftRight);
    this._plotHeight = plotHeight;
    this._plotWidth = plotWidth;
    let yratio = (plotHeight / abs);
    let xratio = (plotWidth) / ~~((stop - start) / 2);
    this.xstart = ~~(start / 2) / this.sampleRate;
    this.xstop = ~~(stop / 2) / this.sampleRate;
    this.abs = abs;
    this.yratio = yratio;
    let frame = ~~((stop - start) / (plotWidth*2)) || 1;
    let total = 0;
    let totalBot = 0;
    let startTime = performance.now();
    let stopsize = 10000;
    let breakTime = PLOT_WAVEFORM_BREAKTIME || stopsize;
    var top = [];
    var bottom = [];
    this._untaintedCanvasCTX.clearRect(0, 0, this._canvas.width, this._canvas.height);
    this._untaintedCanvasCTX.fillStyle = "#ff0000";
    this._untaintedCanvasCTX.fillText("Browser doesn't support offScreenCanvas upgrade browser for better performace", 0, 8);
    this._untaintedCanvasCTX.fillStyle = this.options.traceColor;
    this._untaintedCanvasCTX.fillRect(0 + this.options.marginLeftRight, this._plotHeight + this.options.marginTopBottom, this._canvas.width - this.options.marginLeftRight - this.options.marginLeftRight, 1);

    for (let i = start; i < stop; i += 2) {
      if (i % breakTime === 0) {
        if (performance.now() - startTime > 20) {
          if (this._currentDraw !== pstart) {
            console.log("Abort _currentDraw");
            return; //We are drawing something new.
          }
          this._draw(top, bottom);
          top = [];
          bottom = [];
          await new Promise((resolve) => setTimeout(resolve, 0));
          if (this._currentDraw !== pstart) {
            console.log("Abort _currentDraw");
            return; //We are drawing something new.
          }
          startTime = performance.now();
          //breakTime = i + stopsize;
        } else {
          breakTime++;
        }
      }
      /*
            if (i % breakTime === 0 && performance.now() - startTime > 20) {
              if (this._currentDraw !== pstart) {
                console.log("Abort _currentDraw");
                return; //We are drawing something new.
              }
              this._draw(top, bottom);
              top = [];
              bottom = [];
              await new Promise((resolve) => setTimeout(resolve, 0));
              if (this._currentDraw !== pstart) {
                console.log("Abort _currentDraw");
                return; //We are drawing something new.
              }
              startTime = performance.now();
              //breakTime = i + stopsize;
            }*/
      if (i % frame === 0) {
        if (frame === 1) {
          total = data[i];
          totalBot = data[i + 1];
        }
        pt = total;
        ptY = (plotHeight - (pt / abs * plotHeight)) + this.options.marginTopBottom;
        ptX = (((i - start) * xratio) / 2) + this.options.marginLeftRight;
        total = 0;
        top.push([ptX, ptY]);
        pt = totalBot;
        ptY = (plotHeight - (pt / abs * plotHeight)) + this.options.marginTopBottom;
        totalBot = 0;
        bottom.push([ptX, ptY]);
        //this.ctx.lineTo(ptX, ptY);
      } else {
        //total = Math.max(total,data[2 * i]);
        /*let t = data[2 * i];
        let b = data[2 * i + 1];
        total = (t > total) ? t : total;*/
        if (data[i] > total) {
          total = data[i];
        }
        //totalBot = Math.min(totalBot,data[2 * i + 1]);
        //totalBot = (b < totalBot) ? b : totalBot;
        if (data[i + 1] < totalBot) {
          totalBot = data[i + 1];
        }
      }
    }
    PLOT_WAVEFORM_BREAKTIME = breakTime;
    this._draw(top, bottom);
    this.emit("replot");
    console.log("Plot stop draw", start, stop, "Time: " + (performance.now() - pstart));
    //this.xratio = buffer.duration / this._canvas.width;
  }
  _draw(top, bottom) {
    //console.log("drawing",top,bottom)
    this._untaintedCanvasCTX.beginPath();
    this._untaintedCanvasCTX.moveTo(top[0][0], top[0][1]);
    for (let i = 0; i < top.length; i++) {
      let ptX = top[i][0];
      let ptY = top[i][1];
      this._untaintedCanvasCTX.lineTo(ptX, ptY);
    }
    for (let i = bottom.length - 1; i > 0; i--) {
      let ptX = bottom[i][0];
      let ptY = bottom[i][1];
      this._untaintedCanvasCTX.lineTo(ptX, ptY);
    }
    this._untaintedCanvasCTX.strokeStyle = this.options.traceColor;
    //this.ctx.stroke();
    this._untaintedCanvasCTX.closePath();
    this._untaintedCanvasCTX.fillStyle = this.options.traceColor;
    this._untaintedCanvasCTX.fill();
    this.ctx.drawImage(this._untaintedCanvas, 0, 0);
  }
  processBuffer(buffer) {
    this.sampleRate = buffer.sampleRate;
    if (RENDER_OFF_SCREEN) {
      var chans = [];
      var channels = buffer.numberOfChannels;
      for (var c = 0; c < channels; c++) {
        var chan = buffer.getChannelData(c);
        chans.push(chan);
      }
      this.worker.postMessage({
        msg: 'processBuffer',
        buffer: {
          numberOfChannels: buffer.numberOfChannels,
          sampleRate: buffer.sampleRate,
          length: buffer.length,
          channels: chans
        }
      }, chans.map(chan => chan.buffer));
      return;
    }
    this.buffer = buffer;
    this.sampleRate = buffer.sampleRate;
    var i;
    var channels = buffer.numberOfChannels;
    var strt = 0;
    var stp = buffer.length;
    var maxYValue = Number.NEGATIVE_INFINITY;
    var minYValue = Number.POSITIVE_INFINITY;
    var monoChannel = new Float32Array(buffer.length*2);
    for (var c = 0; c < channels; c++) {
      var chan = buffer.getChannelData(c);
      for (i = strt; i <= stp; i++) {
        var pos = 2 * i;
        var value = chan[i];
        if (value > maxYValue) {
          maxYValue = value;
        }
        if (value < minYValue) {
          minYValue = value;
        }
        if (value > 0) {
          if (monoChannel[pos] < value) {
            monoChannel[pos] = value;
          }
        } else {
          if (monoChannel[pos + 1] > value) {
            monoChannel[pos + 1] = value;
          }
        }
      }
    }
    this._abs = -minYValue > maxYValue ? -minYValue : maxYValue;
    this._data = monoChannel;
  }
  addPlugin(plugin, zorder) {
    if (zorder === undefined) {
      zorder = Number.MAX_VALUE;
    }
    if (zorder <= 0) {
      throw "Invalid plugin zorder";
    }
    plugin.onAdd(this);
    plugin._plot = this;
    var canvas = document.createElement('canvas');
    canvas.width = this._canvas.width;
    canvas.height = this._canvas.height;
    this._plugins.push({
      plugin: plugin,
      zorder: zorder,
      canvas: canvas
    });
    this._plugins.sort(function(a, b) {
      return (a.zorder - b.zorder);
    });
    //console.log(this._plugins);
    this.refreshPlugin();
  }
  removePlugin(plugin) {
    var self = this;
    for (var i = 0; i < this._plugins.length; i++) {
      if (this._plugins[i].plugin === plugin) {
        plugin = this._plugins.splice(i, 1)[0];
      }
    }
    if (plugin.plugin instanceof PluginBase) {
      plugin = plugin.plugin;
    }
    if (plugin instanceof PluginBase) {
      //console.log("Removing Plugin ",plugin);
      plugin.onRemove(self);
    }

  }
  refreshPlugin(plugin) {
    if (!this._canvas.width || !this._canvas.height) {
      return;
    }
    this.ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    this._pluginsCtx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    this.ctx.drawImage(this._untaintedCanvas, 0, 0);
    var self = this;
    if (!plugin) {
      this._plugins.forEach(function(plugin) {
        self.refreshPlugin(plugin);
      });
      return;
    }
    if (plugin instanceof PluginBase) {
      var instance = plugin;
      plugin = undefined;
      for (var i = 0, n = this._plugins.length; i < n; i++) {
        if (this._plugins[i].plugin === instance) {
          plugin = this._plugins[i];
        } else {
          if (this._plugins[i].canvas.width && this._plugins[i].canvas.height) {
            this._pluginsCtx.drawImage(this._plugins[i].canvas, 0, 0);
          }
        }
      }
    }
    if (plugin) {
      plugin.canvas.width = this._canvas.width;
      plugin.canvas.height = this._canvas.height;
      plugin.plugin.refresh(plugin.canvas);
      this._pluginsCtx.drawImage(plugin.canvas, 0, 0);
    }
    this.ctx.drawImage(this._pluginCanvas, 0, 0);
  }
}








Plot.Mouse = {
  LEFTCLICK: 1,
  RIGHTCLICK: 3,
  MIDDLECLICK: 2
};
Plot.defaults = {
  backgroundColor: "black",
  traceColor: "#0FF",
  marginLeftRight: 10,
  marginTopBottom: 11
};
