import {
  Client,
  login,
  query,
} from "https://deno.land/x/mediawiki@0.0.1/api/mod.ts";

import env from "../env.ts";

export const client = new Client(
  env.SITE,
  new Headers({ "User-Agent": "RojBot" }),
);

await client.invoke(login({ lgname: env.LGNAME, lgpassword: env.LGPASSWORD }));

export const { query: { tokens: { csrftoken } } } = await client.invoke(query({
  meta: "tokens",
}));
