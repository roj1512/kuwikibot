import * as path from "https://deno.land/std@0.140.0/path/mod.ts";

export function from(where: string, what: string) {
  return path.join(
    path.dirname(path.fromFileUrl(where)),
    what,
  );
}
