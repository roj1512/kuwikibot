import { difference } from "https://deno.land/std@0.140.0/datetime/mod.ts";

import {
  edit,
  parse,
  query,
} from "https://deno.land/x/mediawiki@0.0.1/api/mod.ts";

import { client, csrftoken } from "../client.ts";
import { from, search } from "../utils.ts";

const corrections: [string, string] = Object.entries(JSON.parse(
  await Deno.readTextFile(from(import.meta.url, "data.json")),
  // deno-lint-ignore no-explicit-any
)) as any;

const correctedCount = Object.fromEntries(corrections.map((v) => [v[1], 0]));
const correctedPages = Object.fromEntries(
  corrections.map((v) => [v[1], new Array<string>()]),
);
const revisions: Record<string, number[]> = {};
const start = new Date();
for (const [key, value] of corrections) {
  for await (
    const result of search(
      client,
      query({ list: "search", srsearch: key, srlimit: "max" }),
    )
  ) {
    if (!result.snippet.includes('<span class="searchmatch">')) {
      continue;
    }
    let { parse: { wikitext: { "*": text } } } = await client.invoke(parse({
      prop: "wikitext",
      page: result.title,
    }));
    const exp = new RegExp(`\\s${key}`, "g");
    const match = text.match(exp);
    if (!match || match.length == 0) {
      continue;
    }
    text = text.replace(exp, `$1${value}`).replace(
      exp,
      `$1${value}`,
    );
    const { edit: { newrevid } } = await client.invoke(edit({
      text,
      title: result.title,
      summary: "چاککردنەوەی ھەڵەی ڕێنووس/ڕێزمان",
      token: csrftoken,
      bot: true,
    }));
    if (revisions[result.title] == undefined) {
      revisions[result.title] = [];
    }
    revisions[result.tile].push(newrevid);
    correctedCount[value] += match.length;
    correctedPages[value].push(result.title);
  }
}
const difference_ = difference(start, new Date(), {
  units: ["hours", "minutes", "seconds", "milliseconds"],
});
const elapsed =
  `${difference_.hours}:${difference_.hours}:${difference_.seconds}.${difference_.milliseconds}`;
await Deno.writeTextFile(
  `${start.getTime()}.txt`,
  JSON.stringify(
    {
      start: start.toUTCString(),
      elapsed,
      correctedCount,
      correctedPages,
    },
    null,
    8,
  ),
);
