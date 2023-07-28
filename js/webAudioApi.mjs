console.log("hello world");

/**
 * base of all Web Audio API
 */
const audioContext = new AudioContext(); // creates BaseAudioContext, use a OfflineAudioContext if playing isn't necessary

/**
 * loading sound
 */

const testSongAudioElement = document.getElementById("testSongAudid");
// create source node (also known as input node)
const trackSourceNode =
  audioContext.createMediaElementSource(testSongAudioElement);

/**
 * controlling sound
 * autoplay is managed by browsers autoplay support policies
 * user or allowlist must give permission
 */

// output node is not strictly necessary, AudioContext.destination can be used as an alternative
// trackSourceNode.connect(audioContext.destination); // see below (modification nodes before the destination)

// play-pause button
const playPauseButton = document.getElementById("playPauseButton");
playPauseButton.addEventListener("click", () => {
  // Check if context is in suspended state (autoplay policy)
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  // Play or pause track depending on state
  if (playPauseButton.dataset.playing === "false") {
    testSongAudioElement.play();
    playPauseButton.dataset.playing = "true"; // set "data-playing" HTML data-attribute
  } else if (playPauseButton.dataset.playing === "true") {
    testSongAudioElement.pause();
    playPauseButton.dataset.playing = "false";
  }
});

// audioElement eventhandling
testSongAudioElement.addEventListener("ended", () => {
  playButton.dataset.playing = "false";
});

/**
 * modifying sound
 */

// alternative => new GainNode()
const gainNode = audioContext.createGain();
// trackSourceNode.connect(gainNode).connect(audioContext.destination); // see below (modification nodes before the destination)

const volumeControl = document.getElementById("volumeInput");
volumeControl.addEventListener("input", () => {
  gainNode.gain.value = volumeControl.value; // allow user to change gain
});

/**
 * stereo panning
 */
const pannerOptions = { pan: 0 };
const panner = audioContext.createStereoPanner();
panner.pannerOptions = pannerOptions;
// new StereoPannerNode(audioContext, pannerOptions);

const pannerControl = document.getElementById("pannerInput");
pannerControl.addEventListener("input", () => {
  panner.pan.value = pannerControl.value;
});

trackSourceNode
  .connect(gainNode)
  .connect(panner)
  .connect(audioContext.destination);

const devButton = document.getElementById("devButton");
devButton.addEventListener("click", () => {
  console.log({ inputs: trackSourceNode.numberOfInputs });
});

/**
 * todo
 * You almost got it right.
 * Use a single GainNode and connect each source to the single input to the GainNode.
 * This will sum up all of the different connections and produce a single output.
 */
