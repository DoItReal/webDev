var video, htmlTracks, htmlTracks;
var trackStatusesDiv, cuesDiv;

window.onload = function () {
    // called when the page has been loaded
    video = document.querySelector("#myVideo");
    trackStatusesDiv = document.querySelector("#trackStatusesDiv");
    cuesDiv = document.querySelector("#cuesDiv");
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
        var currentCue = textTrack.cues;
        var label = "<li>label = " + currentHtmlTrack.label + "</li>";
        var kind = "<li>kind = " + currentHtmlTrack.kind + "</li>";
        var lang = "<li>lang = " + currentHtmlTrack.srclang + "</li>";
        var readyState = "<li>readyState = " + currentHtmlTrack.readyState + "</li>";
        var modeState = "<li>modeState = " + textTrack.mode + "</li>"

        trackStatusesDiv.innerHTML += "<li><b>Track:" + i + ":</b></li>" + "<ul>" + label + kind + lang + readyState + modeState + "</ul>";
       if(currentCue != null)   displayCues(currentCue);
    }
}
function displayCues(currCue) {
    
    for (let i = 0; i < currCue.length; i++) {
        var cue = currCue[i];
        var id = cue.id + "</br>";
        var timeSegment = cue.startTime + " => * " + cue.endTime + "</br>";
        var textSegment = cue.text + "</br>";
        
        cuesDiv.innerHTML += "<li>" + id + timeSegment + textSegment + "</li>";
    }
}