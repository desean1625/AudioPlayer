(function(window, undefined) {
    var AudioPlayer = function(div, options) {
        //var context, analyser, audioNode, plot, accordion, whiteLine;
        defaultOptions = {
            fftSize: 1024,
            averaging: 0,
        };
        that = this;
        if (typeof div == "string") div = document.querySelector("div");
        plot = new sigplot.Plot(div, {
            autohide_panbars: true,
            //rightclick_rubberbox_action: "select",
            //rightclick_rubberbox_mode: "horizontal",
            rubberbox_action: "zoom"
        });
        accordion = new sigplot.AccordionPlugin({
            draw_center_line: true,
            shade_area: true,
            draw_edge_lines: true,
            prevent_drag: true,
            direction: "vertical",
            edge_line_style: {
                strokeStyle: "#FF2400"
            }
        });
        whiteLine = new sigplot.AccordionPlugin({
            draw_center_line: true,
            shade_area: true,
            draw_edge_lines: true,
            prevent_drag: true,
            direction: "vertical",
            edge_line_style: {
                strokeStyle: "#FF2400"
            }
        });
        plot.add_plugin(accordion, 1);
        plot.add_plugin(whiteLine, 1);
        whiteLine.set_center(0);
        whiteLine.set_width(0);
        whiteLine.set_visible(true);
        plot.addListener("mdown", function(evt) {
            if (evt.which != 3) {
                that._start = null;
                return;
            }
            that._start = evt.x;
            accordion.set_visible(true);
        });
        plot.addListener("mmove", function(evt) {
            if (that._start == null) return;
            var width = evt.x - that._start;
            var center = evt.x - (width / 2);
            accordion.set_center(center);
            accordion.set_width(width);
            //that._start = evt.x;
        });
        plot.addListener("mup", function(evt) {
            if (that._start == null) {
                that._start = null;
                return;
            }
            that.loop(that._start, evt.x);
            that._start = null;
        });
        context = new AudioContext();
        analyser = context.createAnalyser();
        analyser.smoothingTimeConstant = 0;
        analyser.fftSize = options.fftSize;
        audioNode = context.createScriptProcessor(options.fftSize * 2, 1, 1);
        audioNode.connect(context.destination);
        audioNode.onaudioprocess = function() {
            // get the average for the first channel
            var array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            // draw the spectrogram
            //pipe to sigplot.push(array);
        }
        this.load = function(url) {
            var request = new XMLHttpRequest();
            request.open('GET', url, true);
            request.responseType = 'arraybuffer';
            request.onload = function() {
                // decode the data
                context.decodeAudioData(request.response, function(buff) {
                    // when the audio is decoded save to the audio buffer
                    buffer = new AudioBuff(context, buff);
                    var overrides = {
                        xdelta: 1 / buffer._buffer.sampleRate
                    }
                    plot.overlay_array(buffer._buffer.getChannelData(0), overrides);
                    var timer = function() {
                        setTimeout(function() {
                            whiteLine.set_center(buffer.getTime());
                            timer()
                        }, 5)
                    }
                    timer();
                }, that.onError);
            }
            request.send();
        }
        this.onError = function(e) {
            console.log(e);
        }
        this.play = function(start) {
            if (!this._buffer) {
                console.log("No audio Loaded");
                return;
            }
            start = start || 0;
            buffer.seek(start);
        }
        this.stop = function() {
            buffer.stop();
            accordion.set_visible(false);
        }
        this.loop = function(start, stop) {
            start = start || 0;
            stop = stop || 1;
            var width = stop - start;
            var center = stop - (width / 2);
            buffer.loop(start, stop);
            accordion.set_center(center);
            accordion.set_width(width);
            accordion.set_visible(true);
        }
    }
    window.AudioPlayer = AudioPlayer;
    var AudioBuff = function(audioContext, buffer) {
        this._audioContext = audioContext;
        this._buffer = buffer; // AudioBuffer
        this._source; // AudioBufferSourceNode
        this._playbackTime = 0; // time of the audio playback, seconds
        this._startTimestamp = 0; // timestamp of last playback start, milliseconds
        this._isPlaying = false;
        this._bufferDuration = 0; // seconds
        // Whenever we get a new AudioBuffer, we create a new AudioBufferSourceNode and reset
        // the playback time. Make sure any existing audio is stopped beforehand.
        this.initNewBuffer = function(buffer) {
            this.stop();
            this._buffer = buffer;
            this._playbackTime = 0;
        }
        // Create a new AudioBufferSourceNode
        this.initSource = function() {
            this._source = this._audioContext.createBufferSource();
            this._source.buffer = this._buffer;
            this._source.connect(this._audioContext.destination);
            // Bind the callback to this
            var endOfPlayback = this.endOfPlayback.bind(this);
            this._source.onended = endOfPlayback;
        }
        // Play the currently loaded buffer
        this.play = function(start, sourceInit) {
            console.log("Play");
            var start = start || 0; // when to schedule playback, 0 is immediately
            if (start < 0) start = 0;
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
        }
        this.loop = function(start, stop) {
            console.log("Looping " + start + " " + stop);
            this.stop();
            if(start == stop){
                this.play(start);
                return;
            }
            if(stop < start){
                var tmp = start;
                start = stop;
                stop = tmp;
                delete tmp;
            }
            this.initSource();
            this._loop = true;
            this._source.loopStart = start;
            this._source.loopEnd = stop;
            this._source.loop = true;
            this.play(start, true);
        }
        // Seek to a specific playbackTime (seconds) in the audio buffer. Do not change
        // playback state.
        this.seek = function(playbackTime) {
            if (playbackTime === undefined) return;
            if (playbackTime > this._buffer.duration) {
                console.log("[ERROR] Seek time is greater than duration of audio buffer.");
                return;
            }
            this.stop(); // Stop any existing playback if there is any
            this._playbackTime = playbackTime;
            this.play(); // Resume playback at new time
        }
        // Pause playback, keep track of where playback stopped
        this.pause = function() {
            this.stop(true);
        }
        // Stops or pauses playback and sets playbackTime accordingly
        this.stop = function(pause) {
            console.log("Stop");
            this._isPlaying = false; // Set to flag to endOfPlayback callback that this was set manually
            if (!this._source) return;
            this._source.stop(0);
            // If paused, calculate time where we stopped. Otherwise go back to beginning of playback (0).
            this._playbackTime = pause ? (Date.now() - this._startTimestamp) / 1000 + this._playbackTime : 0;
        }
        this.getTime = function() {
            //console.log(this._isPlaying)
            if(!this._isPlaying) return 0;
            if (this._loop && ((Date.now() - this._startTimestamp) / 1000 + this._playbackTime) > this._source.loopEnd) this._startTimestamp = Date.now();
            return this._isPlaying ? (Date.now() - this._startTimestamp) / 1000 + this._playbackTime : 0;
        }
        // Callback for any time playback stops/pauses
        this.endOfPlayback = function(endEvent) {
            console.log("end of playback");
            // If playback stopped because end of buffer was reached
            //if (this._isPlaying) this._playbackTime = 0;
            //this._isPlaying = false;
        }
        this.init = (function() {
            this.initNewBuffer(this._buffer);
        });
    };
})(window);