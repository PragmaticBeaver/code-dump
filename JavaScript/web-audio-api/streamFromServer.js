console.log("hello world");

let mediaRec = undefined; // for streaming

const audioReceiverElement = document.getElementById("audioReceiver");
let receiverAudioContext = undefined; // for receiving audio blobs

const socket = io("http://localhost:4000");
socket.on("audio", async (audioData) => {
  console.log("received - audio", audioData);

  // todo from stack overflow, could work? https://stackoverflow.com/questions/70002015/streaming-into-audio-element
  // const ws = new window.WebSocket(url);
  // ws.onmessage = (_) => {
  //   console.log("Media source not ready yet... discard this package");
  // };

  // const mediaSource = new window.MediaSource();
  // const audio = document.createElement("audio");
  // audio.src = window.URL.createObjectURL(mediaSource);
  // audio.controls = true;
  // document.body.appendChild(audio);

  // mediaSource.onsourceopen = (_) => {
  //   const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg"); // mpeg appears to not work in Firefox, unfortunately :(
  //   ws.onmessage = (e) => {
  //     const soundDataBase64 = JSON.parse(e.data);
  //     const bytes = window.atob(soundDataBase64);
  //     const arrayBuffer = new window.ArrayBuffer(bytes.length);
  //     const bufferView = new window.Uint8Array(arrayBuffer);
  //     for (let i = 0; i < bytes.length; i++) {
  //       bufferView[i] = bytes.charCodeAt(i);
  //     }
  //     sourceBuffer.appendBuffer(arrayBuffer);
  //   };
  // };

  async function playAudio(audioData) {
    // Play using the Web Audio API
    const audioBuffer = receiverAudioContext.createBuffer(
      1,
      receiverAudioContext.sampleRate * 0.25, // length = sampleRate * seconds since last Blob
      receiverAudioContext.sampleRate
    );
    console.log({ audioBuffer });

    // Play using the Audio element
    const audioBlob = new Blob([audioData], { type: "audio/wav" });
    console.log({ audioBlob });
    const audioUrl = URL.createObjectURL(audioBlob);
    console.log({ audioUrl });
    audioReceiverElement.setAttribute("src", audioUrl);
    console.log({ audioReceiverElement });
    await audioReceiverElement.play();
    console.log("hello");
  }
  await playAudio(audioData);
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

  mediaRec.addEventListener("dataavailable", async (event) => {
    console.log("dataavailable", event.data);
    socket.emit("audio", event.data);
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
