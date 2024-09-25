import { createClient } from "@supabase/supabase-js";
import { createWriteStream } from "https://deno.land/std@0.134.0/node/fs.ts";
import ytdl from "npm:ytdl-core@latest";
import { Controller, Get, Query, Request, Response } from "oak_decorators";
import { SupabaseAuth } from "../../middlewares/auth.middleware.ts";

@Controller("youtube")
export class YoutubeController {
  @Get("live")
  @SupabaseAuth()
  live(
    @Request() request: Request,
    @Query("id") id: string,
    @Query("sentiaTypeId") sentiaTypeId: string,
    @Query("language") language: string,
    @Query("url") url: string,
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

    // https://www.youtube.com/watch?v=jNQXAC9IVRw -> jNQXAC9IVRw
    const vidId = url.split("v=")[1];

   ytdl("http://www.youtube.com/watch?v=aqz-KE-bpKQ").on(
      "data",
      (chunk) => {
        console.log(chunk);
      }
    );

    return { status: "ok" };
  }
}
