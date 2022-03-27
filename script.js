var video, htmlTracks, htmlTracks;
var trackStatusesDiv, cuesDiv, cuesLiveDiv, spanTranscript;

window.onload = function () {
    // called when the page has been loaded
    video = document.querySelector("#myVideo");
    trackStatusesDiv = document.querySelector("#trackStatusesDiv");
    cuesDiv = document.querySelector("#cuesDiv");
    cuesLiveDiv = document.querySelector("#cuesLiveDiv");
    spanTranscript = document.querySelector("#divTranscript");
    spanTranscript.innerHTML = "";
    // Get the tracks as HTML elements
    htmlTracks = document.querySelectorAll("track");
    

    // display their status in a div under the video
    displayTrackStatuses();
};

function displayTrackStatuses() {
    trackStatusesDiv.innerHTML = "";
    cuesDiv.innerHTML = "";

    // display track info
    for (var i = 0; i < htmlTracks.length; i++) {
        var currentHtmlTrack = htmlTracks[i];
        var textTrack = currentHtmlTrack.track;
        textTrack.addEventListener("cuechange", function (e) {
            var cue = this.activeCues[0];
            displayCuesLive(cue);
        });
        var currentCue = textTrack.cues;
        var label = "<li>label = " + currentHtmlTrack.label + "</li>";
        var kind = "<li>kind = " + currentHtmlTrack.kind + "</li>";
        var lang = "<li>lang = " + currentHtmlTrack.srclang + "</li>";
        var readyState = "<li>readyState = " + currentHtmlTrack.readyState + "</li>";
        var modeState = "<li>modeState = " + textTrack.mode + "</li>"

        trackStatusesDiv.innerHTML += "<li><b>Track:" + i + ":</b></li>" + "<ul>" + label + kind + lang + readyState + modeState + "</ul>";

        if (currentCue != null) displayCuesList(currentCue);
    }
}
function displayCuesList(currCue) {
    cuesDiv.innerHTML = "";
    spanTranscript.innerHTML = "";
    for (let i = 0; i < currCue.length; i++) {
        var cue = currCue[i];
        var id = cue.id + "&emsp;";
        var timeSegment = "&emsp;" + cue.startTime + " => * " + cue.endTime + "</br>";
        var textSegment = "&emsp;" + cue.text + "</br>";
        
        cuesDiv.innerHTML += "<li>" + id + timeSegment + textSegment + "</li>";

        spanTranscript.innerHTML += "<li class=\"trans\" id=li" + i + " onclick='jumpTo("
            + cue.startTime + ");'" + ">" + textSegment + "</li>";
    }
   
}
function displayCuesLive(cue) {
    if (cue == null) return;
  
            var id = cue.id + "&emsp;";
            var timeSegment = "&emsp;" + cue.startTime + " => * " + cue.endTime + "</br>";
    var textSegment = "&emsp;" + cue.text;
    var liNode = document.getElementById("li" + (parseInt(cue.id)-1)).style.color = "red";
    cuesLiveDiv.innerHTML += "<li>" + id + timeSegment + textSegment + "</li>";
  
    cue.onexit = function () {
        cuesLiveDiv.innerHTML = "";
        var liNode = document.getElementById("li" + (parseInt(cue.id) - 1)).style.color = "black";
    };
}
function jumpTo(time) {
    video.currentTime = time;
    video.play();
}