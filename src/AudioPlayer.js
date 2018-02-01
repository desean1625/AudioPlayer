/* global window */
/* global AudioContext */
/* global console */
/* global module */
/* global require */
(function() {
"use strict";
var Class = require("./Class");
var Plot = require("./Plot");

Plot.Plugin = Class.extend({
    options: {
        refreshOnOptionChange: true
    },
    init: function() {
        console.log("Abstract constructor Method");
    },
    onAdd: function(plot) {
        console.log("Abstract onAdd Method what to do when added to plot");
    },
    refresh: function(canvas) {
        console.log("Abstract refresh Method what to do when asked to be redrawn");
    },
    removeFrom: function(plot) {
        this.enabled = false;
        plot.removePlugin(this);
    },
    onRemove: function(plot) {
        console.log("Abstract destructor Method");
    },
    addTo: function(plot) {
        this.enabled = true;
        this._plot = plot;
        plot.addPlugin(this);
    },
    setOptions: function(options) {
        //Object.assign(this.options, options);
        var update = function(dst, src) {
            for (var prop in src) {
                var val = src[prop];
                if (typeof val === "object") { // recursive
                    update(dst[prop], val);
                } else {
                    dst[prop] = val;
                }
            }
            return dst; // return dst to allow method chaining
        };
        update(this.options, options);
        this.emit("settingsChange", this.options);
        if (this.options.refreshOnOptionChange && this._plot) {
            this._plot.refreshPlugin(this);
        }
    }
});
Plot.Mouse = {
    LEFTCLICK: 1,
    RIGHTCLICK: 3,
    MIDDLECLICK: 2
};
Plot.SelectorPlugin = Plot.Plugin.extend({
    options: {
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
    },
    init: function(options) {
        this.setOptions(options);
    },
    onRemove: function(plot){
        var self = this;
        console.log("ON REMOVE");
        plot.off("mousedown", self._handleMouseDown,self);
        plot.off("mousemove", self._handleMouseMove,self);
        plot.off("mouseup", self._handleMouseUp,self);
    },
    _handleMouseMove: function(e){
        var self = this;
         if (!self._start) {
                return;
            }
            self._stop = e;
            self._plot.refreshPlugin(self);
    },
    _handleMouseDown:function(e) {
        var self = this;
        console.log(e);
        if (e.originalEvent.which === self.options.mouseButton) {
            self.emit("startSelect", e);
            self._start = e;
        } else {
            self.emit("cancelStart", e);
        }
    },
    _handleMouseUp:function(e){
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
    },
    onAdd: function(plot) {
        var self = this;
        this._plot = plot;
        plot.on("mousedown", self._handleMouseDown,self);
        plot.on("mousemove", self._handleMouseMove,self);
        plot.on("mouseup", self._handleMouseUp,self);
    },
    refresh: function(canvas) {
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
});
Plot.ZoomPlugin = Plot.SelectorPlugin.extend({
    options: {
        zoomInOn: "select",
        zoomOutOn: "contextmenu"
    },
    init: function(options) {
        this.setOptions(options);
        this._zoom = [];
        this._currentZoom = {
            start: undefined,
            stop: undefined
        };
        this.on("select", this._handleZoomIn, this);
        this.on("cancelStart", this._handleZoomOut, this);
    },
    _handleZoomIn: function(e) {
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
    },
    _handleZoomOut: function(e) {
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
});
Plot.GridPlugin = Plot.Plugin.extend({
    options: {
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
    },
    init: function(options) {
        this.setOptions(options);
    },
    onAdd: function(plot) {
        var self = this;
        this._plot = plot;
        plot.on("replot", function() {
            plot.refreshPlugin(self);
        });
        //self._plot.refreshPlugin(self);
    },
    refresh: function(canvas) {
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
});
Plot.SliderPlugin = Plot.Plugin.extend({
    options: {
        opacity: 0.5,
        color: "#ffffff",
        lineWidth: 2
    },
    init: function(options) {
        this.setOptions(options);
        this.time = 0;
    },
    onAdd: function(plot) {
        var self = this;
        this._plot = plot;
        plot.on("replot", function() {
            plot.refreshPlugin(self);
        });
        //self._plot.refreshPlugin(self);
    },
    setTime: function(time) {
        this.time = time;
        this._plot.refreshPlugin(this);
    },
    refresh: function(canvas) {
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
});
var AudioBuff = Class.extend({
    options: {
        playbackSpeed: 1
    },
    init: function(audioPlayer, buffer) {
        this._audioPlayer = audioPlayer;
        this._audioContext = audioPlayer.getContext();
        this._buffer = buffer; // AudioBuffer
        this._source = null; // AudioBufferSourceNode
        this._playbackTime = 0; // time of the audio playback, seconds
        this._startTimestamp = 0; // timestamp of last playback start, milliseconds
        this._isPlaying = false;
        this._bufferDuration = 0; // seconds
        this.initNewBuffer(this._buffer);
    },
    initNewBuffer: function(buffer) {
        this.stop();
        this._buffer = buffer;
        this._playbackTime = 0;
    },
    initSource: function() {
        this._source = this._audioContext.createBufferSource();
        this._source.buffer = this._buffer;
        this._source.connect(this._audioContext.destination);
        // Bind the callback to this
        var endOfPlayback = this.endOfPlayback.bind(this);
        this._source.onended = endOfPlayback;
    },
    play: function(start, sourceInit) {
        console.log("Play");
        start = start || 0; // when to schedule playback, 0 is immediately
        if (start < 0) {
            start = 0;
        }
        if (sourceInit) {
            this._source.start(0, start);
        } else {
            this._loop = false;
            this.initSource();
            this._source.start(0, start);
        }
        this._startTimestamp = Date.now();
        this._playbackTime = start;
        this._isPlaying = true;
        this._audioPlayer.emit("audio:start");
    },
    loop: function(start, stop) {
        console.log("Looping " + start + " " + stop);
        this.stop(false,true);
        if (start === stop) {
            this.play(start);
            return;
        }
        if (stop < start) {
            var tmp = start;
            start = stop;
            stop = tmp;
        }
        this.initSource();
        this._loop = true;
        this._source.loopStart = start;
        this._source.loopEnd = stop;
        this._source.loop = true;
        this.play(start, true);
    },
    seek: function(playbackTime) {
        if (playbackTime === undefined) {
            return;
        }
        if (playbackTime > this._buffer.duration) {
            console.log("[ERROR] Seek time is greater than duration of audio buffer.");
            return;
        }
        this.stop(); // Stop any existing playback if there is any
        this._playbackTime = playbackTime;
        this.play(); // Resume playback at new time
    },
    pause: function() {
        this.stop(true);
    },
    stop: function(pause,preventEvent) {
        if(!preventEvent){
            
            this._audioPlayer.emit("audio:stop");
        }
        this._isPlaying = false; // Set to flag to endOfPlayback callback that this was set manually
        if (!this._source) {
            return;
        }
        this._source.stop(0);
        // If paused, calculate time where we stopped. Otherwise go back to beginning of playback (0).
        this._playbackTime = pause ? (Date.now() - this._startTimestamp) / 1000 + this._playbackTime : 0;
    },
    getTime: function() {
        //console.log(this._isPlaying)
        if (!this._isPlaying) {
            return 0;
        }
        if (this._loop && ((Date.now() - this._startTimestamp) / 1000 + this._playbackTime) > this._source.loopEnd) {
            this._startTimestamp = Date.now();
        }
        return this._isPlaying ? (Date.now() - this._startTimestamp) / 1000 + this._playbackTime : 0;
    },
    isPlaying:function(){
        return this._isPlaying;
    },
    endOfPlayback: function(endEvent) {
        console.log("end of playback");
        //this._audioPlayer.emit("audio:stop");
        // If playback stopped because end of buffer was reached
        //if (this._isPlaying) this._playbackTime = 0;
        //this._isPlaying = false;
    }
});
var AudioPlayer = Class.extend({
    options: {
        plot: {}
    },
    init: function(container, options) {
        this.setOptions(options);
        this.buffer = false;
        this._controls = {};
        this._controlPlugins = [];
        var that = this;
        this.context = new AudioContext();
        that._events = {};
        if (typeof container === "string") {
            container = document.querySelector(container);
        }
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
        var plotHeight = container.clientHeight - 30;
        var plotContianer = document.createElement("div");
        plotContianer.style.height = plotHeight;
        container.appendChild(plotContianer);
        this.plot = new Plot(plotContianer,this.options.plot);
        this.slider.addTo(this.plot);
    },
    getContext: function(){
        return this.context;
    },
    addControl: function(control) {
        var button = control.onAdd(this);
        this._controlPlugins.push(control);
        button.setAttribute("data-tooltip",control.options.toolTip);
        this.buttonContainer.appendChild(button);
    },
    load: function(url) {
        var self = this;
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onload = function() {
            // decode the data
            self.context.decodeAudioData(request.response, function(buff) {
                if(self.buffer){
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
        };
        request.send();
    },
    onError: function(e) {
        console.log(e);
    },
    play: function(start) {
        var self = this;
        if (!self.buffer) {
            console.log("No audio Loaded");
            return;
        }
        start = start || 0;
        self.buffer.seek(start);
    },
    stop: function() {
        this.buffer.stop();
        this.loop.removeFrom(this.plot);
    },
    loop: function(start, stop) {
        start = start || 0;
        stop = stop || 1;
        this.buffer.loop(start, stop);
    },
    setOptions: function(options) {
        Object.assign(this.options, options);
        this.emit("settingsChange", this.options);
    }
});
window.AudioPlayer = AudioPlayer;
AudioPlayer.ControlPlugin = Class.extend({
    options: {
        toolTip: "Genric audio control",
        test:"woo"
    },
    init: function() {
        console.log("Abstract constructor Method");
    },
    onAdd: function(audioPlayer) {
        console.log("Abstract onAdd Method returns button or slider for the control bar");
    },
    removeFrom: function(plot) {
        this.enabled = false;
        plot.removePlugin(this);
    },
    onRemove: function(plot) {
        console.log("Abstract destructor Method");
    },
    addTo: function(plot) {
        this.enabled = true;
        this._plot = plot;
        plot.addPlugin(this);
    },
    setOptions: function(options) {
        //Object.assign(this.options, options);
        var update = function(dst, src) {
            for (var prop in src) {
                var val = src[prop];
                if (typeof val === "object") { // recursive
                    update(dst[prop], val);
                } else {
                    dst[prop] = val;
                }
            }
            return dst; // return dst to allow method chaining
        };
        update(this.options, options);
        this.emit("settingsChange", this.options);
    }
});
AudioPlayer.PlayPlugin = AudioPlayer.ControlPlugin.extend({
    options: {
        toolTip: "Play/Pause Audio playback",
        pause: "<a style='font-size:18px;'>&#9208;</a>",
        play: "<a style='font-size:18px;'>&#9654;</a>"
    },
    init: function(options) {
        var self = this;
        this.setOptions(options);
        this._play = document.createElement("a");
        this._play.innerHTML = this.options.play;
        this._play.addEventListener("click", function() {
            self.startPlayback();
        });
    },
    onAdd: function(audioPlayer) {
        var self = this;
        this._audioPlayer = audioPlayer;
        this._audioPlayer.on("audio:stop", function(){
            self._play.innerHTML = self.options.play;
        });
        this._audioPlayer.on("audio:start", function(){
            self._play.innerHTML = self.options.pause;
        });
        return this._play;
    },
    startPlayback: function() {
        var buffer = this._audioPlayer.buffer;
        if (buffer) {
            if(buffer.isPlaying()){
                this.pause = buffer.getTime();
                buffer.pause();
                //this._play.innerHTML = this.options.play;
                return;
            }
            if(!this._audioPlayer.buffer._source){
                buffer.seek(0);
                //this._play.innerHTML = this.options.pause;
                return;
            }
            if (this.pause) {
                buffer.seek(this.pause);
                this.pause = false;
            } else {
                buffer.seek(0);
            }
        }
        //this._play.innerHTML = this.options.pause;
    }
});
AudioPlayer.mergeOptions({
    playButton: true
});
AudioPlayer.mergeOptions({
    plot:Plot.prototype.options
});
AudioPlayer.addInitHook(function() {
    if (this.options.playButton) {
        this._controls.play = new AudioPlayer.PlayPlugin();
        this.addControl(this._controls.play);
    }
});

AudioPlayer.StopPlugin = AudioPlayer.ControlPlugin.extend({
    options: {
        toolTip: "Stop Audio playback",
        stop: "<a style='font-size:25px;'>&#9632;</a>"
    },
    init: function(options) {
        var self = this;
        this.setOptions(options);
        this._stop = document.createElement("a");
        this._stop.innerHTML = this.options.stop;
        this._stop.addEventListener("click", function() {
            self._audioPlayer.buffer.stop();
        });
    },
    onAdd: function(audioPlayer) {
        this._audioPlayer = audioPlayer;
        return this._stop;
    }
});
AudioPlayer.mergeOptions({
    stopButton: true
});
AudioPlayer.addInitHook(function() {

    if (this.options.stopButton) {
        this.addControl(new AudioPlayer.StopPlugin());
    }
});

AudioPlayer.LoopPlugin = AudioPlayer.ControlPlugin.extend({
    options: {
        toolTip: "Loop Audio for select area",
        icon: "<a style='font-size:25px;' >&#8619;</a>"
    },
    init: function(options) {
        var self = this;
        self.enabled = false;
        this.setOptions(options);
        this._loop = document.createElement("a");
        this.select = new Plot.SelectorPlugin();
        //select.addTo(b.plot);
        this._loop.innerHTML = this.options.icon;
        this._loop.addEventListener("click", function() {

            if(self.enabled){
            self.select.removeFrom(self._audioPlayer.plot);
            self.enabled = false;
            self._loop.style.color = "";
                        self._audioPlayer.buffer.stop();
            }else{
                            self._audioPlayer.buffer.stop();
            self.select.addTo(self._audioPlayer.plot);
            self._loop.style.color = "red";
            self.enabled = true;

            }
        });

    },
    onAdd: function(audioPlayer) {
        var self = this;
        this._audioPlayer = audioPlayer;
        self._audioPlayer.on("audio:stop",function(){
            if(self._audioPlayer.plot){
                self.select.removeFrom(self._audioPlayer.plot);
                //self.select.removeFrom(self._audioPlayer.plot);
            }
            self._loop.style.color = "";
            self.enabled = false;
        });
        this.select.on("select",function(e){
            self._audioPlayer.loop(e.start.x,e.stop.x);
        });
        return this._loop;
    }
});

AudioPlayer.mergeOptions({
    loopButton: true,
    loopOptions: AudioPlayer.LoopPlugin.prototype.options
});
AudioPlayer.addInitHook(function() {

    if (this.options.stopButton) {
        this.addControl(new AudioPlayer.LoopPlugin(this.options.loopOptions));
    }
});
AudioPlayer.Plot = Plot;

AudioPlayer.addInitHook(function() {
        var grid = new Plot.GridPlugin();
    grid.addTo(this.plot);
});

module.exports = AudioPlayer;

}());