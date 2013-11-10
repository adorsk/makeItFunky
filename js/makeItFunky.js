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

// Wire up buttons.
$makeItFunkyButtn = $('#makeItFunkyButton');
$playButton = $('#playButton');

$playButton.on('click', function(){
  console.log('play');
  player.play(0, remixed);
});


// Plays a cowbell on every second beat
// You will need to supply your Echo Nest API key, the trackID, and a URL to the track.
// The supplied track and the cowbell file can be found in the audio subdirectory.
var apiKey = 'QQCJEYULWUZXO5U6V';
var gruntURL= '../jb_sounds/jb_unh.wav'

var context;
var gruntBuffer;

var remixer;
var player;
var track;
var remixed;

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


        remixer = createJRemixer(context, $, apiKey);
        player = remixer.getPlayer();
        $("#info").text("Loading analysis data...");

        var clip = getSelectedClip();

        remixer.remixTrackById(clip.trackID, clip.trackURL, function(t, percent) {
            track = t;

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
            }
        });
    }
}

window.onload = init;
