import { Module } from "oak_decorators";
import { DeepgramController } from "./deepgram/deepgram-controller.ts";
import { YoutubeController } from "./deepgram/youtube-controller.ts";

@Module({
  controllers: [DeepgramController, YoutubeController],
  routePrefix: "api/v1",
})
export class AppModule {}
