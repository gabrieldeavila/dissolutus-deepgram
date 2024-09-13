// Example filename: index.js

import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import { io } from "socket.io-client";
import Peer from "simple-peer";
import wrtc from "@koush/wrtc";
import fetcha from "cross-fetch";

const socket = io(
  process.env.NEXT_PUBLIC_SOCKET_URL ??
    "http://localhost:3001",
  {
    autoConnect: false,
  }
);

// URL for the realtime streaming audio you would like to transcribe
const url = "http://stream.live.vc.bbcmedia.co.uk/bbc_world_service";

const live = async () => {
  // STEP 1: Create a Deepgram client using the API key
  const deepgram = createClient("d02172823d14c1ba0b4b70bba28b9bfba109c3d3");

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
      console.log("AAAA");
      socket.emit("callUser", {
        userToCall: "o5g93bN5vKLJquWKwQL9",
        from: id,
      });

      socket.on("receiveChunk", (data) => {
        console.log(data);
        connection.send(data);
      });
    });

    // STEP 4: Fetch the audio stream and send it to the live transcription connection
    // fetcha(url)
    //   .then((r) => r.body)
    //   .then((res) => {
    //     res.on("readable", () => {
    //       connection.send(res.read());
    //     });
    //   });
  });
};

live();
