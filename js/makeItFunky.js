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

$makeItFunkyButton.on('click', function(){
  if (isPlaying){
    stopPlaying();
  }
  disablePlayButton();
  $status.html('Getting up offa that thing...');
  remixIt();
});


var remixIt = function(){
  remixer = createJRemixer(context, $, apiKey);
  player = remixer.getPlayer();
  $("#info").text("Loading analysis data...");

  var clip = getSelectedClip();

  remixer.remixTrackById(clip.trackID, clip.trackURL, function(t, percent) {
    track = t;

    console.log('here');

    $("#info").text(percent + "% of the track loaded");

    if (percent == 100) {
      $("#info").text(percent + "% of the track loaded, remixing...");
    }

    if (track.status == 'ok') {
      remixed = track.analysis.beats;
      for (var i=0; i < remixed.length; i++) {
        if (i % 4 == 1) {
          remixed[i].syncBuffer = gruntBuffer;
        }
      }

      window.t = track;

      $("#info").text("Remix complete!");
      enablePlayButton();

      $status.html('');
    }
  });
}

function init() {
    if (window.webkitAudioContext === undefined) {
        error("Sorry, this app needs advanced web audio. Your browser doesn't"
            + " support it. Try the latest version of Chrome");
    } else {
        context = new webkitAudioContext();

        // Load grunt
        var request = new XMLHttpRequest();
        request.open('GET', gruntURL, true);
        request.responseType = 'arraybuffer';

        request.onload = function() {
        context.decodeAudioData(request.response, function(buffer) {
            gruntBuffer = buffer;
        });
        }
        request.send();
    }
}

window.onload = init;
