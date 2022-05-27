import { query } from "https://deno.land/x/mediawiki@0.0.1/api/mod.ts";

import { client } from "../client.ts";
import { allpages, from } from "../utils.ts";

const data = JSON.parse(
  await Deno.readTextFile(from(import.meta.url, "data.json")),
);

const unexpectedChars: string[] = data.unexpectedChars;
const unexpectedTitles = new Set<string>();

const start = new Date().getTime();
let checks = 0;
let ok = 0;

try {
  for await (
    const page of allpages(client, query({ list: "allpages", aplimit: "max" }))
  ) {
    console.log(`all ${checks} ok ${ok}`);
    checks++;
    let continue_ = false;
    for (const char of unexpectedChars) {
      if (page.title.includes(char)) {
        unexpectedTitles.add(page.title);
        continue_ = true;
        break;
      }
    }
    if (continue_) {
      continue;
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
    unexpectedTitles: [...unexpectedTitles],
  }),
);
