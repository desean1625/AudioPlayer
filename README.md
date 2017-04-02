# AudioPlayer
HTML5 Audio player 


The purpose of this audio player is to display the time domain spectral plot of audio for quick analysis of the audio. (Mainly for speech) being able to visualize the audio helps you skip over the "dead air" so you don't need to listen to silence or static.

In addition to the play/stop buttons right click drag will loop the audio for the selected area. Left click drag will select a portion and the audio player will emit the select event.


Basic usage 
------
```html

<head>
<script src="./vendor/sigplot-minimized.js"></script>
<script src="./vendor/sigplot.plugins-minimized.js"></script>
<script src="./src/AudioPlayer.js"></script>


</head>


<div id="wrapper" style="width:800px;height:400px"></div>

<script>


a = new AudioPlayer("#wrapper",{
        fftSize: 1024,
        averaging: 0,
    });

a.load("./audio/wagner-short.ogg");
a.on("select",function(evt){
  console.log(evt)
})
a.play();
</script>
```
