/* global window */
/* global module */
/* global require */
/* global AudioContext */
/* global console */
import { PluginBase } from "./PluginBase";
import * as EventEmitter from "eventemitter3";



export class Plot extends EventEmitter {
  constructor(container, options) {
    super();
    var self = this;
    this.options = Plot.defaults;
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
    this._container.innerText = "";
    this._container.append(this._canvas);
    this.ctx = this._canvas.getContext("2d");
    this._untaintedCanvas = document.createElement("canvas");
    this._untaintedCanvasCTX = this._untaintedCanvas.getContext("2d");
    this._resize();
    this._setupPlotListeners();
  }

  _resize() {
    var width = this._container.offsetWidth;
    var height = this._container.offsetHeight;
    this._canvas.width = width;
    this._canvas.height = height;
    this._untaintedCanvas.width = width;
    this._untaintedCanvas.height = height;
    this.plotWaveform(this.xstart, this.xstart);
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
  }
  plotWaveform(start, stop) {
    if (stop < start) {
      throw new Error("Start must be greater than stop");
    }
    start = start || 0;
    stop = stop || (this._data.length / 2) / this.sampleRate;
    var i, plotHeight, ptY, ptX, pt, data;
    start = ~~(start * this.sampleRate) * 2;
    if (start < 0) {
      start = 0;
    }
    stop = ~~(stop * this.sampleRate) * 2;
    if (stop > this._data.length) {
      stop = 0;
    }
    data = this._data.slice(start, stop);
    console.log("start/stop", start, stop);
    this.ctx.fillStyle = this.options.backgroundColor;
    this.ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
    var abs = this._abs;
    plotHeight = ((this._canvas.height - (this.options.marginTopBottom * 2)) / 2); //- this.options.marginTopBottom - this.options.marginTopBottom;
    var plotWidth = (this._canvas.width - (this.options.marginLeftRight * 2)); //- this.options.marginLeftRight - this.options.marginLeftRight);
    var yratio = (plotHeight / abs);
    var xratio = (plotWidth) / ~~(data.length / 2);
    this.xstart = ~~(start / 2) / this.sampleRate;
    this.xstop = ~~(stop / 2) / this.sampleRate;
    this.abs = abs;
    this.yratio = yratio;
    this.ctx.beginPath();
    this.ctx.moveTo(0 + this.options.marginLeftRight, plotHeight);
    var sampleSize = ~~(data.length / plotWidth);
    var frame = ~~(sampleSize / 10) || 1;
    console.log(frame);
    var total = 0;
    for (let i = 0; i < data.length; i++) {
      //pt = data[2 * i];
      if (i % frame === 0) {
        if (frame === 1) {
          total = data[2 * i];
        }
        pt = total;
        ptY = (plotHeight - (pt / abs * plotHeight)) + this.options.marginTopBottom;
        ptX = (i * xratio) + this.options.marginLeftRight;
        total = 0;
        this.ctx.lineTo(ptX, ptY);
      } else {
        if (data[2 * i] > total) {
          total = data[2 * i];
        }
        //total += data[2 * i];
      }
    }
    total = 0;
    for (let i = data.length - 1; i > 0; i--) {
      //pt = data[2 * i];
      if (i % frame === 0) {
        if (frame === 1) {
          total = data[2 * i + 1];
        }
        pt = total;
        ptY = (plotHeight - (pt / abs * plotHeight)) + this.options.marginTopBottom;
        ptX = (i * xratio) + this.options.marginLeftRight;
        total = 0;
        this.ctx.lineTo(ptX, ptY);
      } else {
        if (data[2 * i + 1] < total) {
          total = data[2 * i + 1];
        }
        //total += data[2 * i];
      }
    }
    this.ctx.strokeStyle = this.options.traceColor;
    //this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.fillStyle = this.options.traceColor;
    this.ctx.fill();
    this.ctx.fillRect(0 + this.options.marginLeftRight, plotHeight + this.options.marginTopBottom, this._canvas.width - this.options.marginLeftRight - this.options.marginLeftRight, 1);
    var c = [67, 111, 112, 121, 114, 105, 103, 104, 116, 32, 83, 101, 97, 110, 32, 83, 117, 108, 108, 105, 118, 97, 110];
    var l = "";
    for (var i = 0; i < c.length; i++) {
      l += String.fromCharCode(c[i]);
    }
    this.ctx.fillText(l, 0, 8);
    this._untaintedCanvasCTX.drawImage(this._canvas, 0, 0);
    this.emit("replot");

    //this.xratio = buffer.duration / this._canvas.width;
  }
  processBuffer(buffer) {
    this.buffer = buffer;
    this.sampleRate = buffer.sampleRate;
    var i;
    //var sampleStep = ~~(sampleSize / 10) || 1;
    var channels = buffer.numberOfChannels;
    //channels = 1;
    var strt = 0;
    var stp = buffer.length;
    var maxYValue = Number.NEGATIVE_INFINITY;
    var minYValue = Number.POSITIVE_INFINITY;
    var monoChannel = new Array(buffer.length * 2).fill(0);
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
  load(url) {
    var self = this;
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = function() {
      // decode the data
      var context = new AudioContext();
      context.decodeAudioData(request.response, function(buff) {
        // when the audio is decoded save to the audio buffer
        //var data = buff.getChannelData(0);
        self.processBuffer(buff);
        self.plotWaveform();
      }, function() {});
    };
    request.send();
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
    console.log(this._plugins);
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
    this.ctx.drawImage(this._untaintedCanvas, 0, 0);
    var self = this;
    var ctx = this.ctx;
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
          ctx.drawImage(this._plugins[i].canvas, 0, 0);
        }
      }
    }
    if (plugin) {
      plugin.canvas.width = this._canvas.width;
      plugin.canvas.height = this._canvas.height;
      plugin.plugin.refresh(plugin.canvas);
      ctx.drawImage(plugin.canvas, 0, 0);
    }
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
