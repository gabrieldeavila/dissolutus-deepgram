import { Application } from "@oak/oak";
import { assignModule } from "oak_decorators";
import { AppModule } from "../controllers/app.modules.ts";

const app = new Application();

app.use(assignModule(AppModule));

await app.listen({ port: 8000 });
