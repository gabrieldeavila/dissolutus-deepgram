import { createMethodDecorator } from "oak_decorators";

export const SupabaseAuth = createMethodDecorator(
  async (_data, context, next) => {
    context.request.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    const authorization = context.request.headers.get("Authorization");

    if (!authorization) {
      context.response.status = 401;
      context.response.body = { error: "No JWT provided" };
      return;
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      context.response.status = 500;
      context.response.body = { error: "Internal server error" };
      return;
    }

    await next();
  }
);
