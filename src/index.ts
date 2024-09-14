import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import { io } from "https://esm.sh/socket.io-client@4.7.5";

const socket = io("http://localhost:3001", {
  autoConnect: false,
});
const live = () => {
  // The API key you created in step 1
  const deepgramApiKey = "7c4d57f29fde77e166e5f809e42cb9224391d0b2";

  // Initialize the Deepgram SDK
  const deepgram = createClient(deepgramApiKey);

  // Create a websocket connection to Deepgram
  const connection = deepgram.listen.live({
    punctuate: true,
    model: "nova-2",
    language: "pt-BR",
  });

  // Listen for the connection to open.
  connection.on(LiveTranscriptionEvents.Open, () => {
    // Listen for any transcripts received from Deepgram and write them to the console.
    connection.on(LiveTranscriptionEvents.Transcript, (data) => {
      console.dir(data, { depth: null });
    });

    // Listen for any metadata received from Deepgram and write it to the console.
    connection.on(LiveTranscriptionEvents.Metadata, (data) => {
      console.dir(data, { depth: null });
    });

    // Listen for the connection to close.
    connection.on(LiveTranscriptionEvents.Close, () => {
      console.log("Connection closed.");
    });

    socket.on("me", (id) => {
      socket.emit("callUser", {
        userToCall: "SCZgQqi4ckn_77Aec0CL",
        from: id,
      });

      socket.on("receiveChunk", (data) => {
        console.log(data);
        connection.send(data);
      });
    });

    socket.connect();
  });
};

live();
