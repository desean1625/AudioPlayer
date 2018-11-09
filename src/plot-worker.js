console.log("Hello from worker")
var scaleCanvas = new OffscreenCanvas(0, 0);
var scaleCtx = scaleCanvas.getContext("2d");
this.onmessage = (e) => {
  switch (e.data.msg) {
    case 'setCanvas':
      this._canvas = e.data.canvas;
      this.ctx = this._canvas.getContext("2d");
      this._untaintedCanvasCTX = this.ctx;
      break;
    case 'setOptions':
      console.log(e.data)
      this.options = e.data.options;
      break;
    case 'resize':
      var origH = this._canvas.height;
      var origW = this._canvas.width;
      if (this._canvas.width !== 0 && this._canvas.height !== 0) {
        var marginLeft = this.options.marginLeftRight;
        var marginTop = this.options.marginTopBottom;
        scaleCanvas.width = this._canvas.width - marginLeft - marginLeft;
        scaleCanvas.height = this._canvas.height - marginTop - marginTop;
        var img = this.ctx.getImageData(marginLeft, marginTop, origW - marginLeft, origH - marginTop);
        scaleCtx.putImageData(img, 0, 0, 0, 0, scaleCanvas.width, scaleCanvas.height);
      }
      this._canvas.width = e.data.width;
      this._canvas.height = e.data.height;
      if (this._canvas.width === 0 || this._canvas.height === 0) {
        return;
      }
      if (img) {
        this.ctx.drawImage(scaleCanvas, marginLeft, marginTop, this._canvas.width - marginLeft - marginLeft, this._canvas.height - marginTop);
      }
      break;
    case 'processBuffer':
      this.processBuffer(e.data.buffer);
      break;
    case 'plotWaveform':
      this.plotWaveform(e.data.start, e.data.stop);
      break;
  }
};
this.emit = (args) => {
  this.postMessage([args]);
}

this.processBuffer = (buffer) => {
  console.log("processBuffer")
  this.sampleRate = buffer.sampleRate;
  var i;
  var channels = buffer.numberOfChannels;
  var strt = 0;
  var stp = buffer.length;
  var maxYValue = Number.NEGATIVE_INFINITY;
  var minYValue = Number.POSITIVE_INFINITY;
  var monoChannel = new Float32Array(buffer.length * 2);
  for (var c = 0; c < channels; c++) {
    var chan = buffer.channels[c];
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
  this.abs = -minYValue > maxYValue ? -minYValue : maxYValue;
  this._data = monoChannel;
  console.log("processBuffer done")
}



this.plotWaveform = async (start, stop) => {
  let pstart = performance.now();
  this._currentDraw = pstart;
  if (this._canvas.width === 0 || !this._data) {
    return; //No point in working if we cant see the canvas
  }
  if (stop < start) {
    throw new Error("Start must be greater than stop");
  }
  start = start || 0;
  stop = stop || (this._data.length / 2) / this.sampleRate;

  var ptY, ptX, pt, data;
  let marginTopBottom = this.options.marginTopBottom;
  start = ~~(start * this.sampleRate) * 2;
  if (start < 0) {
    start = 0;
  }
  stop = ~~(stop * this.sampleRate) * 2;
  if (stop > this._data.length) {
    stop = this._data.length;
  }
  console.log(start, stop);
  this.ctx.fillStyle = this.options.backgroundColor;
  this.ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
  console.log("Plot start draw", start, stop);
  if (start === stop) {
    this._untaintedCanvasCTX.drawImage(this._canvas, 0, 0);
    this.emit("replot");
    return;
  }
  this.emit("replot:start");
  data = this._data; 
  let abs = this.abs;
  let plotHeight = ((this._canvas.height - (marginTopBottom * 2)) / 2); //- this.options.marginTopBottom - this.options.marginTopBottom;
  let plotWidth = (this._canvas.width - (this.options.marginLeftRight * 2)); //- this.options.marginLeftRight - this.options.marginLeftRight);
  this._plotHeight = plotHeight;
  this._plotWidth = plotWidth;
  let yratio = (plotHeight / abs);
  let xratio = (plotWidth) / ~~((stop - start) / 2);
  this.xstart = ~~(start / 2) / this.sampleRate;
  this.xstop = ~~(stop / 2) / this.sampleRate;
  let frame =  ~~((stop - start) / (plotWidth*10)) || 1;
  let total = 0;
  let totalBot = 0;
  var top = [];
  var bottom = [];
  this._untaintedCanvasCTX.clearRect(0, 0, this._canvas.width, this._canvas.height);
  this._untaintedCanvasCTX.fillStyle = this.options.traceColor;
  this._untaintedCanvasCTX.fillRect(0 + this.options.marginLeftRight, plotHeight + marginTopBottom, plotWidth, 1);
  for (let i = start; i < stop; i += 2) {
    if (i % frame === 0) {
      if (frame === 1) {
        total = data[i];
        totalBot = data[i + 1];
      }
      pt = total;
      ptY = (plotHeight - (pt / abs * plotHeight)) + marginTopBottom;
      ptX = (((i - start) * xratio) / 2) + this.options.marginLeftRight;
      total = 0;
      top.push([ptX, ptY]);
      pt = totalBot;
      ptY = (plotHeight - (pt / abs * plotHeight)) + marginTopBottom;
      totalBot = 0;
      bottom.push([ptX, ptY]);
      //this.ctx.lineTo(ptX, ptY);
    } else {

      if (data[i] > total) {
        total = data[i];
      }
      if (data[i + 1] < totalBot) {
        totalBot = data[i + 1];
      }
    }
  }
  this._draw(top, bottom);
  this.postMessage({
    msg: "setVars",
    vars: {
      xstop: this.xstop,
      xstart: this.xstart,
    }
  })
  this.emit("replot");
  console.log("Plot stop draw", start, stop, "Time: " + (performance.now() - pstart));
  //this.xratio = buffer.duration / this._canvas.width;
}
this._draw = (top, bottom) => {
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
  //this.ctx.drawImage(this._untaintedCanvas, 0, 0);
}
