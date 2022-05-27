import * as path from "https://deno.land/std@0.140.0/path/mod.ts";

import {
  Client,
  ParamsQuery,
  Request,
} from "https://deno.land/x/mediawiki@0.0.1/api/mod.ts";

export function from(where: string, what: string) {
  return path.join(
    path.dirname(path.fromFileUrl(where)),
    what,
  );
}

export function search(client: Client, request: Request<ParamsQuery>) {
  return {
    async *[Symbol.asyncIterator]() {
      let available = true;
      request[1].sroffset = 0;
      while (available) {
        const response = await client.invoke(request);
        if (response.continue) {
          request[1].sroffset = response.continue.sroffset;
        } else {
          available = false;
        }
        for (const result of response.query.search) {
          yield result;
        }
      }
    },
  };
}

export function listall(client: Client, request: Request<ParamsQuery>) {
  return {
    async *[Symbol.asyncIterator]() {
      let available = true;
      request[1].apcontinue = undefined;
      while (available) {
        const response = await client.invoke(request);
        if (response.continue) {
          request[1].apcontinue = response.continue.apcontinue;
        } else {
          available = false;
        }
        for (const result of response.query.allpages) {
          yield result;
        }
      }
    },
  };
}
