// I wrote some pretty kludgy code here, but hack-toring comes before
// refactoring...
//
var apiKey = 'QQCJEYULWUZXO5U6V';
var gruntURL= 'clips/jb_unh.wav'

var context;
var gruntBuffer;

var remixer;
var player;
var isPlaying;
var track;
var remixed;

clipBuffers = {};

var randFromArray = function(arr){
  var randIndex = Math.floor(Math.random() * arr.length);
  return arr[randIndex];
}

// Funkify the title.
$('h1').lettering();

//  Populate the clips selector.
$clipSelect = $('#clipSelect');
for (var i=0; i<clips.length; i++){
  var clip = clips[i];
  var $option = $('<option value="' + i + '">' + clip.label + '</option>');
  $clipSelect.append($option);
}

var getSelectedClip = function(){
  var clipIndex = $clipSelect.val();
  return clips[clipIndex];
}

$status = $('#status');

// Buttons Wiring.
$makeItFunkyButton = $('#makeItFunkyButton');
$playButton = $('#playButton');
$stopButton = $('#stopButton');

var enablePlayButton = function(){
  $playButton.removeClass('disabled');

  $playButton.on('click', function(){
    startPlaying();
  });
}

var disablePlayButton = function(){
  $playButton.addClass('disabled');
  $playButton.off('click');
}

var toggleStopButton = function(){
  if ($stopButton.is(':visible')){
    $playButton.show();
    $stopButton.hide();
  }
  else{
    $playButton.hide();
    $stopButton.show();
  }
}

var stopPlaying = function(){
  console.log('stopPlaying');
  player.stop();
  toggleStopButton();
  isPlaying = false;
}

var startPlaying = function(){
  toggleStopButton();
  player.play(0, remixed);
  isPlaying = true;
}

$stopButton.on('click', function(){
  stopPlaying();
});

// Set play button to disabled initially.
disablePlayButton();

disableMakeItFunkyButton = function(){
  $makeItFunkyButton.addClass('disabled');
  $makeItFunkyButton.off('click');
}

enableMakeItFunkyButton = function(){
  $makeItFunkyButton.removeClass('disabled');
  $makeItFunkyButton.on('click', function(){
    if (isPlaying){
      stopPlaying();
    }
    disablePlayButton();
    disableMakeItFunkyButton();
    $status.html('Getting up offa that thing...');
    remixIt();
  });
}

// Start w/ make it funky enabled.
enableMakeItFunkyButton();

var lastGruntId;
var getGruntClipBuffer = function(){
  var clip = randFromArray(gruntClips);
  while (clip.id == lastGruntId){
    clip = randFromArray(gruntClips);
  }
  lastGruntId = clip.id;
  return clipBuffers[clip.id];
}

var wailCounter = 0;
var getWailClipBuffer = function(){
  var clipId = wailClips[wailCounter % wailClips.length].id;
  wailCounter++;
  return clipBuffers[clipId];
}

var remixIt = function(){
  remixer = createJRemixer(context, $, apiKey);
  player = remixer.getPlayer();
  $("#info").text("Loading analysis data...");

  var clip = getSelectedClip();

  remixer.remixTrackById(clip.trackID, clip.trackURL, function(t, percent) {
    track = t;

    enableMakeItFunkyButton();

    $("#info").text(percent + "% of the track loaded");

    if (percent == 100) {
      $("#info").text(percent + "% of the track loaded, remixing...");
    }

    if (track.status == 'ok') {
      remixed = track.analysis.beats;
      for (var i=0; i < remixed.length; i++) {

        var beatBuffer = undefined;

        if (i == 0){
           beatBuffer = clipBuffers[beFunkyClip.id];
        }

        else if (i == remixed.length - 1){
          beatBuffer = getWailClipBuffer();
        }

        else if (i % 4 == 0) {
          beatBuffer = getGruntClipBuffer();
        }

        if (beatBuffer){
          remixed[i].syncBuffer = beatBuffer;
        }
      }

      window.t = track;

      $("#info").text("Remix complete!");
      enablePlayButton();

      $status.html('');
    }
  });
}

var loadClip = function(clip){
  var request = new XMLHttpRequest();
  request.open('GET', clip.trackURL, true);
  request.responseType = 'arraybuffer';

  request.onload = function() {
    context.decodeAudioData(request.response, function(buffer) {
      clipBuffers[clip.id] = buffer;
    });
  }
  request.send();
};

function init() {
    if (window.webkitAudioContext === undefined) {
        alert("Sorry, this app needs advanced web audio. Your browser doesn't"
            + " support it. Try the latest version of Chrome");
    } else {
        context = new webkitAudioContext();

        // Load up the Godfather!
        for (var i = 0; i < gruntClips.length; i++){
          loadClip(gruntClips[i]);
        }

        for (var i = 0; i < wailClips.length; i++){
          loadClip(wailClips[i]);
        }

        loadClip(beFunkyClip);
    }
}

window.onload = init;
