import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import fetcha from "npm:cross-fetch@4.0.0";

const live = () => {
  // The API key you created in step 1
  const deepgramApiKey = "";

  // URL for the real-time streaming audio you would like to transcribe
  const url = "https://www.dissolutus.com/en-US/stream/VazczwsPhfJwFajAxQqw";

  // Initialize the Deepgram SDK
  const deepgram = createClient(deepgramApiKey);

  // Create a websocket connection to Deepgram
  const connection = deepgram.listen.live({
    punctuate: true,
    model: "nova-2",
    language: "pt-BR",
  });

  // Listen for the connection to open.
  connection.on(LiveTranscriptionEvents.Open, async () => {
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

    // Send streaming audio from the URL to Deepgram.
    fetcha(url)
      .then((r) => {
        console.log(r);

        return r.body;
      })
      .then((res) => {
        if (!res) return;

        console.log(res.on, "ratata");

        res.on("readable", () => {
          connection.send(res.read());
        });
      });
  });
};

live();
