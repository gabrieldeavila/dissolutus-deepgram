// Example filename: index.js

import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import { io } from "socket.io-client";
import Peer from "simple-peer";
import wrtc from "@koush/wrtc";
import fetch from "cross-fetch";

const socket = io(
  process.env.NEXT_PUBLIC_SOCKET_URL ??
    "https://dissolutus-socket-production.up.railway.app",
  {
    autoConnect: false,
  }
);

// URL for the realtime streaming audio you would like to transcribe
const url = "http://stream.live.vc.bbcmedia.co.uk/bbc_world_service";

const live = async () => {
  // STEP 1: Create a Deepgram client using the API key
  const deepgram = createClient("");

  // STEP 2: Create a live transcription connection
  const connection = deepgram.listen.live({
    model: "nova-2",
    language: "en-US",
    smart_format: true,
  });

  // STEP 3: Listen for events from the live transcription connection
  connection.on(LiveTranscriptionEvents.Open, () => {
    connection.on(LiveTranscriptionEvents.Close, () => {
      console.log("Connection closed.");
    });

    connection.on(LiveTranscriptionEvents.Transcript, (data) => {
      console.log(data.channel.alternatives[0].transcript);
    });

    connection.on(LiveTranscriptionEvents.Metadata, (data) => {
      console.log(data);
    });

    connection.on(LiveTranscriptionEvents.Error, (err) => {
      console.error(err);
    });

    socket.connect();
    socket.on("me", (id) => {
      const peer = new Peer({ initiator: true, wrtc });
      console.log(peer);

      peer.on("signal", (data) => {
        console.log("CHAmAnDO O CARA", id, data);
        socket.emit("callUser", {
          userToCall: "3ld4py-OCPMzUzohbKzq",
          signalData: data,
          from: id,
        });
      });
      peer.on("stream", (currentStream) => {
        // mediaStream -> currentStream
        const chunks = [];

        console.log(chunks, currentStream.getTracks());
        console.dir(currentStream);
      });
      socket.on("callAccepted", (signal) => {
        peer.signal(signal);
      });
    });

    // STEP 4: Fetch the audio stream and send it to the live transcription connection
    fetch(url)
      .then((r) => r.body)
      .then((res) => {
        res.on("readable", () => {
          console.log("Sending audio data...", res.read(), res);
          connection.send(res.read());
        });
      });
  });
};

live();
