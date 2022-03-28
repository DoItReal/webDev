var video, htmlTracks, htmlTracks;
var trackStatusesDiv, cuesDiv, cuesLiveDiv, spanTranscript, langButtonDiv, currentLangSpan;

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


    // display their status in a div under the video
    updateTrackStatuses();
};

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