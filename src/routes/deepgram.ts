import { Router } from "@oak/oak";

export const deepgramRouter = new Router();

deepgramRouter.get("/", (ctx) => {
  ctx.response.body = "Get all products route\n";
});
