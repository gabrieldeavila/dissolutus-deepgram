import { Controller, Get } from "oak_decorators";

@Controller("deepgram")
export class DeepgramController {
  @Get("base")
  bounceUserAgent() {
    return { status: "ok" };
  }
}
