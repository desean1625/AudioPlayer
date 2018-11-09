/* global window */
/* global AudioContext */
/* global console */
/* global module */
/* global require */
import { PluginBase } from "./PluginBase";
import * as $ from "jquery";
import { SelectorPlugin } from "./SelectorPlugin";
import { ZoomPlugin } from "./ZoomPlugin";
import { GridPlugin } from "./GridPlugin";
import { SliderPlugin } from "./SliderPlugin";
import { Plot } from "./Plot";
import { AudioBuff } from "./AudioBuff";
import * as controls from "./controls";
import "font-awesome/css/font-awesome.css";
Plot.SelectorPlugin = SelectorPlugin;
Plot.ZoomPlugin = ZoomPlugin;
Plot.GridPlugin = GridPlugin;
Plot.SliderPlugin = SliderPlugin;





export class AudioPlayer extends PluginBase {
  constructor(container, options) {
    var defaults = {
      plot: {
        backgroundColor: "black",
        traceColor: "#0FF",
        marginLeftRight: 10,
        marginTopBottom: 11
      }
    };
    super(defaults);
    this.setOptions(options);
    this.buffer = false;
    this._controls = {};
    this._controlPlugins = [];
    var that = this;
    this.context = new AudioContext();
    this.spinner = $("<i class='fa fa-spin fa-spinner' style='position:absolute;left:50%;top:50%;font-size:30px;display:none;z-index: 100; color: white;'></i>");

    that._events = {};
    if (typeof container === "string") {
      container = document.querySelector(container);
    }
    this.container = container;
    this.container.appendChild(this.spinner[0]);
    container.style.position = "relative";
    var buttonContainer = document.createElement("div");
    this.buttonContainer = buttonContainer;
    buttonContainer.style.backgroundColor = this.options.plot.backgroundColor;
    buttonContainer.style.color = this.options.plot.traceColor;
    buttonContainer.style.height = "30px";
    buttonContainer.style.paddingLeft = this.options.plot.marginLeftRight;
    container.appendChild(buttonContainer);
    this.slider = new Plot.SliderPlugin({
      opacity: 0.7,
      color: "#ff0000"
    });
    var plotContianer = document.createElement("div");
    container.appendChild(plotContianer);
    this._plotContainer = plotContianer;
    this.plot = new Plot(plotContianer, this.options.plot);
    this.plot.on("replot:start",()=>{
      this.spinner.show();
    });
    this.plot.on("replot",()=>{
      this.spinner.hide();
    });
    this.resize();
    this.slider.addTo(this.plot);
    this.callInitHooks();
  }

  resize() {
    this._plotContainer.style.height = this.container.clientHeight - 30 + "px";
    this.plot._resize();
  }

  getContext() {
    return this.context;
  }
  addControl(control) {
    var button = control.onAdd(this);
    this._controlPlugins.push(control);
    button.setAttribute("data-tooltip", control.options.toolTip);
    this.buttonContainer.appendChild(button);
  }
  load(url, useCredentials = false) {
    this.spinner.show();
    var self = this;
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.withCredentials = useCredentials;
    request.onload = function() {
      // decode the data
      
      self.context.decodeAudioData(request.response, function(buff) {
        if (self.buffer) {
          self.buffer.stop();
        }
        // when the audio is decoded save to the audio buffer
        self.buffer = new AudioBuff(self, buff);
        self.plot.processBuffer(buff);
        self.plot.plotWaveform();
        var timer = function() {
          self.slider.setTime(self.buffer.getTime());
          window.requestAnimationFrame(timer);
        };

        window.requestAnimationFrame(timer);
      }, self.onError);
      
      //self.plot.worker.postMessage(request.response, [request.response]);
    };
    request.send();
  }
  onError(e) {
    console.log(e);
  }
  play(start) {
    var self = this;
    if (!self.buffer) {
      console.log("No audio Loaded");
      return;
    }
    start = start || 0;
    self.buffer.seek(start);
  }
  stop() {
    this.buffer.stop();
    this.loop.removeFrom(this.plot);
  }
  loop(start, stop) {
    start = start || 0;
    stop = stop || 1;
    this.buffer.loop(start, stop);
  }
  callInitHooks() {
    if (this._initHooksCalled) {
      return;
    }
    this._initHooksCalled = true;
    for (var i = 0, len = this._initHooks.length; i < len; i++) {
      this._initHooks[i].call(this);
    }
  };
}
AudioPlayer.prototype.options = {};

AudioPlayer.mergeOptions = function(options) {
  Object.assign(this.prototype.options, options);
  return AudioPlayer;
};

AudioPlayer.addInitHook = function(fn) { // (Function) || (String, args...)
  var args = Array.prototype.slice.call(arguments, 1);
  var init = typeof fn === 'function' ? fn : function() {
    this[fn].apply(this, args);
  };
  this.prototype._initHooks = this.prototype._initHooks || [];
  this.prototype._initHooks.push(init);
};
for (let key in controls) {
  var control = controls[key];
  if (control.hasOwnProperty("mergeOptions")) {
    //console.log("mergeOptions", control.mergeOptions);
    AudioPlayer.mergeOptions(control.mergeOptions);
  }
  if (control.hasOwnProperty("initHook")) {
    //console.log("initHook", control.initHook);
    AudioPlayer.addInitHook(control.initHook);
  }
}




AudioPlayer.Plot = Plot;

AudioPlayer.addInitHook(function() {
  var grid = new Plot.GridPlugin();
  grid.addTo(this.plot);
});



window.AudioPlayer = AudioPlayer;
