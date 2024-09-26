import { Module } from "oak_decorators";
import { DeepgramController } from "./deepgram/deepgram-controller.ts";

@Module({
  controllers: [DeepgramController],
  routePrefix: "api/v1",
})
export class AppModule {}
