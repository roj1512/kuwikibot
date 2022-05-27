import { query } from "https://deno.land/x/mediawiki@0.0.1/api/mod.ts";

import { client } from "../client.ts";
import { from, listall } from "../utils.ts";

const data = JSON.parse(
  await Deno.readTextFile(from(import.meta.url, "data.json")),
);

const unexpectedChars: string[] = data.unexpectedChars;
const unexpectedTitles = new Array<string>();

const start = new Date().getTime();
let checks = 0;
let ok = 0;

try {
  for await (const page of listall(client, query({ list: "listall" }))) {
    console.log(`all ${checks} ok ${ok}`);
    checks++;
    for (const char of unexpectedChars) {
      if (page.title.includes(char)) {
        unexpectedTitles.push(page.title);
        continue;
      }
    }
    ok++;
  }
} catch (_err) {
  //
}

await Deno.writeTextFile(
  `titles-${start}.json`,
  JSON.stringify({
    start,
    now: new Date().getTime(),
    checks,
    ok,
  }),
);
