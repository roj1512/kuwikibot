import { difference } from "https://deno.land/std@0.140.0/datetime/mod.ts";

import { invokeGet, invokePost, search } from "../../api/mod.ts";
import "../preact.ts";
import { from } from "../utils.ts";

const corrections: [string, string] = Object.entries(JSON.parse(
  await Deno.readTextFile(from(import.meta.url, "data.json")),
  // deno-lint-ignore no-explicit-any
)) as any;

function prepareSubstring(subtring: string) {
  return ` ${subtring} `;
}

const correctedCount = Object.fromEntries(corrections.map((v) => [v[1], 0]));
const correctedPages = Object.fromEntries(
  corrections.map((v) => [v[1], new Array<string>()]),
);
const revisions: Record<string, number[]> = {};
const start = new Date();
for (const [key, value] of corrections) {
  for await (const result of search(key)) {
    if (!result.snippet.includes('<span class="searchmatch">')) {
      continue;
    }
    let { parse: { wikitext: { "*": text } } } = await invokeGet("parse", {
      prop: "wikitext",
      page: result.title,
    });
    const exp = new RegExp(prepareSubstring(key), "g");
    const match = text.match(exp);
    if (!match || match.length == 0) {
      continue;
    }
    text = text.replace(exp, prepareSubstring(value)).replace(
      exp,
      prepareSubstring(value),
    );
    const { edit: { newrevid } } = await invokePost("edit", {
      text,
      title: result.title,
      summary: "چاککردنەوەی ھەڵەی ڕێنووس/ڕێزمان",
    }, { assertSuccess: true, passCsrfToken: true });
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
