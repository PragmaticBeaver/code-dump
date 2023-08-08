console.log("hello world");

let mediaRec = undefined; // for streaming

const audioReceiverElement = document.getElementById("audioReceiver");
let receiverAudioContext = undefined; // for receiving audio blobs

const socket = io("http://localhost:4000");
socket.on("audio", async (audioData) => {
  console.log("received - audio", audioData);
  const blob = new Blob([audioData]);
  const buffer = await blob.arrayBuffer();

  receiverAudioContext.decodeAudioData(buffer, (decodedData) => {
    const source = receiverAudioContext.createBufferSource();
    source.buffer = decodedData;
    source.connect(receiverAudioContext.destination);
    source.start();
  });
});
socket.on("test-back", (data) => {
  console.log("test-back", data);
});

const initBtn = document.getElementById("initBtn");
initBtn.addEventListener("click", (event) => {
  console.log("initBtn", event);

  /**
   * ==> init receiver code <==
   */

  receiverAudioContext = new (window.AudioContext ||
    window.webkitAudioContext)();

  /**
   * ==> init sender code <==
   */

  const audioContext = new AudioContext();
  // Check if context is in suspended state (autoplay policy)
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  const audioSource = document.getElementById("audioSource");
  const audioSourceNode = audioContext.createMediaElementSource(audioSource);
  audioSourceNode.connect(audioContext.destination);

  // stream data to server
  const streamDestination = audioContext.createMediaStreamDestination();
  audioSourceNode.connect(streamDestination);
  mediaRec = new MediaRecorder(streamDestination.stream);

  mediaRec.addEventListener("dataavailable", (event) => {
    console.log("dataavailable", event.data);
    if (event.data.size > 0) {
      socket.emit("audio", event.data); // sent blob
    }
  });

  mediaRec.addEventListener("stop", () => {
    console.log("onstop", event);
  });
});

const startBtn = document.getElementById("startBtn");
startBtn.addEventListener("click", (event) => {
  console.log("startBtn", event);
  if (!mediaRec) return;

  if (mediaRec.state === "paused") {
    mediaRec.resume();
  } else {
    mediaRec.start(250);
  }
});

const pauseBtn = document.getElementById("pauseBtn");
pauseBtn.addEventListener("click", (event) => {
  console.log("pauseBtn", event);
  if (mediaRec) {
    mediaRec.pause();
  }
});

const stopBtn = document.getElementById("stopBtn");
stopBtn.addEventListener("click", (event) => {
  console.log("stopBtn", event);
  if (mediaRec) {
    mediaRec.stop();
  }
});
