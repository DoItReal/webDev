var video, htmlTracks, htmlTracks;
var trackStatusesDiv, cuesDiv, cuesLiveDiv, spanTranscript, langButtonDiv, currentLangSpan;
var filters = [];
var canvasVisBefore, canvasVisBeforeContext, canvasVisBeforeType, canvasVisAfter, canvasVisAfterContext, canvasVisAfterType;
var analyserBefer, dataArrayBefore, bufferLengthBefore, analyserAfter, dataArrayAfter, bufferLengthAfter;
var widthBefore, heightBefore, widthAfter, heightAfter;
//web audio API
var gainExample, gainSlider, gainNode, balanceSlider, balanceNode, compressorButton, compressorNode, biquadfilterNode;
var ctx = window.AudioContext || window.webkitAudioContext;
var audioContext = new ctx();
var compressorOn = false;

canvasVisBeforeType = "wave";
canvasVisAfterType = "wave";
window.onload = function () {
    // called when the page has been loaded
    langButtonDiv = document.querySelector("#langButtonDiv");
    currentLangSpan = document.querySelector("#currentLangSpan");
    video = document.querySelector("#myVideo");
    trackStatusesDiv = document.querySelector("#trackStatusesDiv");
    cuesDiv = document.querySelector("#cuesDiv");
    cuesLiveDiv = document.querySelector("#cuesLiveDiv");
    spanTranscript = document.querySelector("#divTranscript");
    spanTranscript.innerHTML = "";
    // Get the tracks as HTML elements
    htmlTracks = document.querySelectorAll("track");
    
    //build Button for language change
    buildButtons();

    //get canvas context

    canvasVisBefore = document.getElementById("canvasVisualizerBefore");
    canvasVisBeforeContext = canvasVisBefore.getContext('2d');

    canvasVisAfter = document.getElementById("canvasVisualizerAfter");
    canvasVisAfterContext = canvasVisAfter.getContext('2d');

    widthBefore = canvasVisBefore.width;
    heightBefore = canvasVisBefore.height;
    widthAfter = canvasVisAfter.width;
    heightAfter = canvasVisAfter.height;

    // display their status in a div under the video
    updateTrackStatuses();

    
    


    //web Audio API

    //get audio context
  

    //the audio element
     player = document.querySelector("#gainExample");
    player.onplay = () => { audioContext.resume(); }

    gainSlider = document.querySelector("#gainSlider");
    balanceSlider = document.getElementById("balanceSlider");
    compressorButton = document.getElementById("compressorButton");

    buildAudioGraph();
    events();
    animationFrames();
   
};
function animationFrames() {
    var visBeforeAnimationId = requestAnimationFrame(visualize);
  //  var visAfterAnimationId = requestAnimationFrame(visualize());
}
function events() {
    //event change gain on input
    document.getElementById("gainValue").value = gainSlider.value;
    gainSlider.oninput = function (evt) {
        document.getElementById("gainValue").value = evt.target.value;
        gainNode.gain.value = evt.target.value;
    }

    //event change balance on input
    document.getElementById("balanceValue").value = balanceSlider.value;
    balanceSlider.oninput = function (evt) {
        document.getElementById("balanceValue").value = evt.target.value;
        balanceNode.pan.value = evt.target.value;
    };
    //event change compressor button style
    compressorButton.onclick = function (evt) {
        if (compressorOn) {
            compressorNode.disconnect(filters[0]);
            gainNode.disconnect(compressorNode);
            gainNode.connect(filters[0]);
            compressorButton.innerHTML = "Turn compressor ON";
            compressorButton.style.background = "red";
        } else {
            gainNode.disconnect(filters[0]);
            gainNode.connect(compressorNode);
            compressorNode.connect(filters[0]);
            compressorButton.innerHTML = "Turn compressor OFF";
            compressorButton.style.background = "lightgreen";
        }
        compressorOn = !compressorOn;
    };
    // TO DO event change wave type on button click 
 


}

function buildAudioGraph() {
    var source = audioContext.createMediaElementSource(player);

    gainNode = audioContext.createGain();
    balanceNode = audioContext.createStereoPanner();
    compressorNode = audioContext.createDynamicsCompressor();

    source.connect(balanceNode);
    balanceNode.connect(gainNode);
 
    

    [60, 170, 350, 1000, 3500, 10000].forEach(function (freq, i){
        var EQnode = audioContext.createBiquadFilter();
        EQnode.frequency.value = freq;
        EQnode.type = "peaking";
        EQnode.gain.value = 0;
        filters.push(EQnode);
    });
         //to connect the biquadFilter
        gainNode.connect(filters[0]);
       
        for (var i = 0; i < filters.length - 1; i++) {
            filters[i].connect(filters[i + 1]);
        }
        

    // Create an analyser node Before Canvas
    analyserBefore = audioContext.createAnalyser();
    // set visualizer options, for lower precision change 1024 to 512,
    // 256, 128, 64 etc. bufferLength will be equal to fftSize/2

    analyserInit("before", 1024);
    source.connect(analyserBefore);


    // Create an analyser node After Canvas
    analyserAfter = audioContext.createAnalyser();
    filters[filters.length - 1].connect(analyserAfter);
    // set visualizer options, for lower precision change 1024 to 512,
    // 256, 128, 64 etc. bufferLength will be equal to fftSize/2
    analyserInit("after", 1024);
    analyserAfter.connect(audioContext.destination);

}
function analyserInit(anal, fft) {
    switch(anal){
        case 'before':
            analyserBefore.fftSize = fft;
            bufferLengthBefore = analyserBefore.frequencyBinCount;
            dataArrayBefore = new Uint8Array(bufferLengthBefore);
            break;
        case 'after':
            analyserAfter.fftSize = fft;
            bufferLengthAfter = analyserAfter.frequencyBinCount;
            dataArrayAfter = new Uint8Array(bufferLengthAfter);
            break;
        default:
            console.log("#analyserInit# unrecognized analyser: '" + anal + "'");
    }

}
function changeVisualizerType(newType) {
    cancelAnimationFrame(visBeforeAnimationId);

    switch (newType) {
        case 'wave':
            if (canvasVisBeforeType == "wave" && canvasVisAfterType == "wave") break;
           canvasVisBeforeType = "wave";
            canvasVisAfterType = "wave";
            analyserInit("before", 1024);
            analyserInit("after", 1024);
            break;
        case 'bar':
            if (canvasVisBeforeType == "bar" && canvasVisAfterType == "bar") break;
           canvasVisBeforeType = "bar";
            canvasVisAfterType = "bar";
            analyserInit("before", 256);
            analyserInit("after", 256);
            break;
        default:
            console.log('Error #changeVisualizerType# unrecognized type: ' + newType);
            break;
    }
    visBeforeAnimationId = requestAnimationFrame(visualize);
}
function visualizeClear() {
    canvasVisBeforeContext.clearRect(0, 0, widthBefore, heightBefore);
    canvasVisAfterContext.clearRect(0, 0, widthAfter, heightAfter);


    //blur 
    {
        canvasVisBeforeContext.fillStyle = 'rgba(0, 0, 0, 0.5)';
        canvasVisBeforeContext.fillRect(0, 0, widthBefore, heightBefore);

        canvasVisAfterContext.fillStyle = 'rgba(0, 0, 0, 0.5)';
        canvasVisAfterContext.fillRect(0, 0, widthAfter, heightAfter);
    }
    canvasVisBeforeContext.font = '30px serif';
    canvasVisAfterContext.font = '30px serif';

    canvasVisBeforeContext.strokeText("Before Filters", 10, 25);
    canvasVisAfterContext.strokeText("After Filters", 10, 25);
}
function visualizeGetAnalyserData() {
    //left canvas
    if (canvasVisBeforeType == "wave") {
        analyserBefore.getByteTimeDomainData(dataArrayBefore);
    } else if (canvasVisBeforeType == "bar") {
        analyserBefore.getByteFrequencyData(dataArrayBefore);
    } else console.log('Error unrecognized waveform: "' + canvasVisBeforeType + '"');

    //right canvas
    if (canvasVisAfterType == "wave") {
        analyserAfter.getByteTimeDomainData(dataArrayAfter);
    } else if (canvasVisAfterType == "bar") {
        analyserAfter.getByteFrequencyData(dataArrayAfter);
    } else console.log('Error unrecognized waveform: "' + canvasVisAfterType + '"');
}
function visDrawWaveForm(){
        canvasVisBeforeContext.lineWidth = 2;
        canvasVisBeforeContext.strokeStyle = 'lightBlue';

        canvasVisAfterContext.lineWidth = 2;
        canvasVisAfterContext.strokeStyle = 'lightBlue';

        // the waveform is in one single path, first let's
        // clear any previous path that could be in the buffer
        canvasVisBeforeContext.beginPath();
        var sliceWidth = widthBefore / bufferLengthBefore;
        var x = 0;


        //before
        {
            for (let i = 0; i < bufferLengthBefore; i++) {
                // dataArray values are between 0 and 255,
                // normalize v, now between 0 and 1
                let v = dataArrayBefore[i] / 255;
                // y will be in [0, canvas height], in pixels
                let y = v * heightBefore;

                if (i === 0) {
                    canvasVisBeforeContext.moveTo(x, y);
                } else {
                    canvasVisBeforeContext.lineTo(x, y);
                }

                x += sliceWidth;
            }

            canvasVisBeforeContext.lineTo(widthBefore, heightBefore / 2);
            // draw the path at once
            canvasVisBeforeContext.stroke();

        }
        //after
        canvasVisAfterContext.beginPath();
        var sliceWidthAfter = widthAfter / bufferLengthAfter;
        x = 0;
        {
            for (let i = 0; i < bufferLengthAfter; i++) {
                // dataArray values are between 0 and 255,
                // normalize v, now between 0 and 1
                let v = dataArrayAfter[i] / 255;
                // y will be in [0, canvas height], in pixels
                let y = v * heightAfter;
                if (i === 0) {
                    canvasVisAfterContext.moveTo(x, y);
                } else {
                    canvasVisAfterContext.lineTo(x, y);
                }

                x += sliceWidthAfter;
            }

            canvasVisAfterContext.lineTo(widthAfter, heightAfter / 2);
        }
        // draw the path at once
        canvasVisAfterContext.stroke();
}
function visDrawBarForm() {
    //   console.log(canvasVisBeforeType + " " + canvasVisAfterType);
    //before
    var barWidthBefore = canvasVisBefore.width / bufferLengthBefore;
    var barHeightBefore;
    var x = 0;
    // values go from 0 to 255 and the canvas heigt is 100. Let's rescale
    // before drawing. This is the scale factor
    var heightScaleBefore = canvasVisBefore.height / 128;
    for (var i = 0; i < bufferLengthBefore; i++) {
        // between 0 and 255
        barHeightBefore = dataArrayBefore[i];

        // The color is red but lighter or darker depending on the value
        canvasVisBeforeContext.fillStyle = 'rgb(' + (barHeightBefore + 100) + ',50,50)';
        // scale from [0, 255] to the canvas height [0, height] pixels
        barHeightBefore *= heightScaleBefore;
        // draw the bar
        canvasVisBeforeContext.fillRect(x, canvasVisBefore.height - barHeightBefore / 2, barWidthBefore, barHeightBefore / 2);

        // 1 is the number of pixels between bars - you can change it
        x += barWidthBefore + 1;
    }

    //after
    var barWidthAfter = canvasVisAfter.width / bufferLengthAfter;
    var barHeightAfter;
    var x = 0;
    // values go from 0 to 255 and the canvas heigt is 100. Let's rescale
    // before drawing. This is the scale factor
    var heightScaleAfter = canvasVisAfter.height / 128;
    for (var i = 0; i < bufferLengthAfter; i++) {
        // between 0 and 255
        barHeightAfter = dataArrayAfter[i];

        // The color is red but lighter or darker depending on the value
        canvasVisAfterContext.fillStyle = 'rgb(' + (barHeightAfter + 100) + ',50,50)';
        // scale from [0, 255] to the canvas height [0, height] pixels
        barHeightAfter *= heightScaleAfter;
        // draw the bar
        canvasVisAfterContext.fillRect(x, canvasVisAfter.height - barHeightAfter / 2, barWidthAfter, barHeightAfter / 2);

        // 1 is the number of pixels between bars - you can change it
        x += barWidthAfter + 1;
    }
}
function visualize() {

    // 1 - Clear, blur the canvas and add Before, After text
    visualizeClear();

    // 2 - Get the analyser data - for waveforms we need time domain data
    visualizeGetAnalyserData(); 

    // 3 - draws the waveform
    if (canvasVisBeforeType == "wave" && canvasVisAfterType == "wave") visDrawWaveForm();
    else if (canvasVisBeforeType == "bar" && canvasVisAfterType == "bar") visDrawBarForm();
    else console.log("Error #visualize# 3- drawing waveforms input canvasVisBeforeType: " + canvasVisBeforeType + " canvasVisAfterType: " + canvasVisAfterType);

    // 4 - draw volume meter
    drawVolumeMeter(canvasVisBefore, canvasVisBeforeContext, analyserBefore, dataArrayBefore);
    drawVolumeMeter(canvasVisAfter, canvasVisAfterContext, analyserAfter, dataArrayAfter);

    // once again call the visualize function at 60 frames/s
    visBeforeAnimationId = requestAnimationFrame(visualize);

}
function BiquadFilter(val, hz) {
    filters[hz].gain.value = val;
}



function updateTrackStatuses() {
    trackStatusesDiv.innerHTML = "";
    cuesDiv.innerHTML = "";

    // display track info
    for (var i = 0; i < htmlTracks.length; i++) {
        var currentHtmlTrack = htmlTracks[i];
        var textTrack = currentHtmlTrack.track;
        textTrack.addEventListener("cuechange", function (e) {
            var cue = this.activeCues[0];

            //to do to move it out of here
                     displayCuesLive(cue);
        });
        var currentCue = textTrack.cues;
        var label = "<li>label = " + currentHtmlTrack.label + "</li>";
        var kind = "<li>kind = " + currentHtmlTrack.kind + "</li>";
        var lang = "<li>lang = " + currentHtmlTrack.srclang + "</li>";
        var readyState = "<li>readyState = " + currentHtmlTrack.readyState + "</li>";
        var modeState = "<li>modeState = " + textTrack.mode + "</li>"

        trackStatusesDiv.innerHTML += "<ul><li><b>Track:" + i + ":</b></li>" + label + kind + lang + readyState + modeState + "</ul>";

        if (currentCue != null && activeTrack()) displayCuesList(currentCue);
    }
}
//display cuesList and Transcript 
function displayCuesList(currCue) {
    cuesDiv.innerHTML = "";
    spanTranscript.innerHTML = "";
    currCue = currentTrack().cues;
    for (let i = 0; i < currCue.length; i++) {
        var cue = currCue[i];
        var id = cue.id + "&emsp;";
        var timeSegment = "&emsp;" + cue.startTime + " => * " + cue.endTime + "</br>";
        var textSegment = "&emsp;" + cue.text + "</br>";
        
        cuesDiv.innerHTML += "<li>" + id + timeSegment + textSegment + "</li>";

        //display Transcript;
        spanTranscript.innerHTML += "<li class=\"trans\"" + " onclick='jumpTo("
            + cue.startTime + ");'" + ">" + textSegment + "</li>";
    }
   
}
function displayCuesLive(cue) {
    if (cue == null) return;
  
            var id = cue.id + "&emsp;";
            var timeSegment = "&emsp;" + cue.startTime + " => * " + cue.endTime + "</br>";
    var textSegment = "&emsp;" + cue.text;
}
function jumpTo(time) {
    video.currentTime = time;
    video.play();
}
function changeSubsToEnglish() {
    if (activeTrack() === 'en') {
        return;
    } else {
        deactivateTracks();
        for (let i = 0; i < video.textTracks.length; i++) {
            if (video.textTracks[i].language === "en" && video.textTracks[i].kind === "subtitles") video.textTracks[i].mode = "showing"; 
        }
    }
}
function changeSubsToGerman() {
    if (activeTrack() === 'de') {
        console.log("de");
    }
    console.log(activeTrack());
    deactivateTracks();
    console.log(activeTrack());
}
function activeTrack() {
    for (let i = 0; i < video.textTracks.length; i++) {
        if (video.textTracks[i].mode === "showing") {
            return video.textTracks[i].language;
        }
    }
    return "no subbtitles/captions playing";
}
function currentTrack() {
    for (let i = 0; i < video.textTracks.length; i++) {
        if (video.textTracks[i].mode === "showing") {
            return video.textTracks[i];
        }
    }
    return "no subbtitles/captions playing";
}
function deactivateTracks() {
    for (let i = 0; i < video.textTracks.length; i++) {
        if (video.textTracks[i].mode === "showing") video.textTracks[i].mode = "disabled";
    }
}


function buildButtons() {
    if (video.textTracks) {

        // for each track, create a button
        for (var i = 0; i < video.textTracks.length; i++) {
            // We create buttons only for the caption and subtitle tracks
            var track = video.textTracks[i];
            if ((track.kind !== "subtitles") && (track.kind !== "captions")) continue;

            createButton(video.textTracks[i]);
        }
    }
}
function createButton(track) {
    var b = document.createElement("button");
    b.value = track.label;
    b.setAttribute("lang", track.language);

    b.addEventListener('click', function (e) {
        // check which track is the track with the language we're
        // looking for
        var lang = this.getAttribute('lang');
        for (var i = 0; i < video.textTracks.length; i++) {
            if (video.textTracks[i].language == lang && video.textTracks[i].kind === "subtitles") {
                video.textTracks[i].mode = 'showing';
            } else {
                video.textTracks[i].mode = 'hidden';
            }
        }
        // update the span so that it displays the new active track
        currentLangSpan.innerHTML = activeTrack();
    });
    b.appendChild(document.createTextNode(track.label));
    langButtonDiv.appendChild(b);
}


function drawVolumeMeter(canvas,canvasContext, analyser, dataArray) {

    canvasContext.save();
    analyser.getByteFrequencyData(dataArray);
    var average = getAverageVolume(dataArray);
    // set the fill style to a nice gradient
    gradient = canvasContext.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(1, '#000000');
    gradient.addColorStop(0.75, '#ff0000');
    gradient.addColorStop(0.25, '#ffff00');
    gradient.addColorStop(0, '#ffffff');
    canvasContext.fillStyle = gradient;
    // draw the vertical meter
    canvasContext.fillRect(0, canvas.height - average, 25, canvas.height);
    canvasContext.strokeStyle = 'gray';
    canvasContext.lineWidth = '1px';
    canvasContext.strokeRect(0, canvas.height - average, 25, canvas.height);
    canvasContext.restore();
}

function getAverageVolume(array) {
    var values = 0;
    var average;
    var length = array.length;
    // get all the frequency amplitudes
    for (var i = 0; i < length; i++) {
        values += array[i];
    }
    average = values / length;
    return average;
}
