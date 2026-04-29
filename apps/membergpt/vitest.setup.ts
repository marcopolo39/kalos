import { config } from "dotenv";
import { resolve } from "path";

// Load root .env.local (has SUPABASE_SERVICE_ROLE_KEY)
config({ path: resolve(__dirname, "../../.env.local") });
// Load app-level .env.local (NEXT_PUBLIC vars), without overriding root vars
config({ path: resolve(__dirname, ".env.local"), override: false });
