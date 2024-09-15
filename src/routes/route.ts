import { Application } from "@oak/oak";
import { assignModule } from "oak_decorators";
import { AppModule } from "../controllers/app.modules.ts";
import { oakCors } from "oakCors";
import "dotenv";

const app = new Application({});

app.use(assignModule(AppModule));
app.use(
  oakCors({
    origin: Deno.env.get("CORS_ORIGIN")!,
    optionsSuccessStatus: 200,
  })
);

console.log("Server running! 🚀");
await app.listen({ port: 8000 });
