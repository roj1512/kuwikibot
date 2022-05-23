import "https://deno.land/x/dotenv@v3.2.0/load.ts";
import { cleanEnv, str } from "https://deno.land/x/envalid@v0.0.3/mod.ts";

export default cleanEnv(Deno.env.toObject(), {
  ENDPOINT: str({ default: "https://test.wikipedia.org/w/api.php" }),
  LGNAME: str(),
  LGPASSWORD: str(),
  LGNAMEWITHOUTAT: str()
});
