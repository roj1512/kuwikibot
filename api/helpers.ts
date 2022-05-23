import { invokeGet, invokePost } from "./requests.ts";
import env from "../env.ts";

export async function login() {
  const { query: { tokens: { logintoken } } } = await invokeGet(
    "query",
    { meta: "tokens", type: "login" },
  );
  await invokePost("login", {
    lgname: env.LGNAME,
    lgpassword: env.LGPASSWORD,
    lgtoken: logintoken,
  }, { assertSuccess: true });
}

export function search(srsearch: string) {
  return {
    async *[Symbol.asyncIterator]() {
      let available = true;
      let sroffset = 0;
      while (available) {
        const response = await invokeGet("query", {
          list: "search",
          srwhat: "text",
          srlimit: "max",
          srsearch,
          sroffset,
        });
        if (response.continue) {
          sroffset = response.continue.sroffset;
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
