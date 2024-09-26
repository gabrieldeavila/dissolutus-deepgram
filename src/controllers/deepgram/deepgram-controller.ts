import {
  LiveTranscriptionEvents,
  createClient as createDeepgram,
} from "@deepgram/sdk";
import { createClient } from "@supabase/supabase-js";
import { Controller, Get, Query, Request, Response } from "oak_decorators";
import { io } from "socket.io-client";
import { SupabaseAuth } from "../../middlewares/auth.middleware.ts";

@Controller("deepgram")
export class DeepgramController {
  @Get("live")
  @SupabaseAuth()
  live(
    @Request() request: Request,
    @Query("id") id: string,
    @Query("sentiaId") sentiaId: string,
    @Query("language") language: string,
    @Response() response: Response
  ) {
    const authorization = request.headers.get("authorization")!;

    response.headers.set("Content-Type", "application/json");
    response.headers.set(
      "Access-Control-Allow-Origin",
      Deno.env.get("CORS_ORIGIN")!
    );

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: {
            authorization,
          },
        },
        auth: {
          persistSession: false,
        },
      }
    );

    const socket = io(Deno.env.get("SOCKET_URL")!, {
      autoConnect: false,
    });

    const deepgram = createDeepgram(Deno.env.get("DEEPGRAM_API_KEY"));

    // Create a websocket connection to Deepgram
    const connection = deepgram.listen.live({
      punctuate: true,
      model: "nova-2",
      diarize: true,
      language: language ?? "pt-BR",
    });

    let isSendingData: null | Promise<boolean> = null;

    connection.on(LiveTranscriptionEvents.Open, () => {
      // Listen for any transcripts received from Deepgram and write them to the console.
      connection.on(
        LiveTranscriptionEvents.Transcript,
        async (data: {
          type: string;
          channel: {
            alternatives: {
              transcript: string;
            }[];
          };
        }) => {
          await isSendingData;
          isSendingData = new Promise((resolve, reject) => {
            let someDataChanged = false;

            (async () => {
              const { data: sentiaData } = await supabase
                .from("sentia")
                .select("text")
                .eq("id", sentiaId)
                .single();

              if (!sentiaData) {
                console.error("Sentia type not found!");
                connection.requestClose();
                reject();
                return;
              }

              data.channel.alternatives.map((alternative) => {
                if (alternative.transcript.length === 0) return;
                someDataChanged = true;

                sentiaData.text = sentiaData.text
                  ? sentiaData.text + "\n" + alternative.transcript
                  : alternative.transcript;
              });

              if (someDataChanged) {
                await supabase
                  .from("sentia")
                  .update({ text: sentiaData.text })
                  .eq("id", sentiaId)
                  .select("*");
              }

              resolve(true);
            })();
          });
        }
      );

      // Listen for any metadata received from Deepgram and write it to the console.
      connection.on(LiveTranscriptionEvents.Metadata, (data) => {
        console.dir(data, "Metadata");
      });

      // Listen for the connection to close.
      connection.on(LiveTranscriptionEvents.Close, () => {
        console.log("Connection closed.");
      });

      socket.on("me", (myId) => {
        socket.emit("callUser", {
          userToCall: id,
          from: myId,
        });

        socket.on("receiveChunk", (data) => {
          connection.send(data);
        });

        socket.on("closeConnection", () => {
          connection.requestClose();
          console.log("Connection closed!");
        });
      });

      socket.connect();
    });

    return { status: "ok" };
  }
}
