import { wrapFetch } from "https://deno.land/x/another_cookiejar@v4.1.4/mod.ts";

import env from "../env.ts";
import { assertSuccess } from "./utils.ts";

const fetch = wrapFetch();

let csrfToken: string;

async function getCsrfToken() {
  if (!csrfToken) {
    const { query: { tokens: { csrftoken } } } = await invokeGet("query", {
      meta: "tokens",
    });
    csrfToken = csrftoken;
  }
  return csrfToken;
}

export type PostParams = Record<string, string | boolean | number | Blob>;

export type GetParams = Record<string, string | boolean | number>;

export interface InvokeOpts {
  assertSuccess?: boolean;
}

export interface PostInvokeOpts extends InvokeOpts {
  passCsrfToken?: boolean;
}

export async function post(
  params: PostParams,
) {
  const body = new FormData();
  for (const [key, value] of Object.entries(params)) {
    body.set(key, value instanceof Blob ? value : String(value));
  }
  const response = await fetch(env.ENDPOINT, {
    method: "POST",
    body,
  });
  return response;
}

export async function get(params: GetParams) {
  const response = await fetch(
    `${env.ENDPOINT}?${new URLSearchParams(
      Object.entries(params).map((v) => [v[0], String(v[1])]),
    )}`,
  );
  return response;
}

export async function invokePost(
  action: string,
  params?: PostParams,
  opts?: PostInvokeOpts,
) {
  params = { action, format: "json", ...params };
  if (action == "edit") {
    params.bot = true;
  }
  if (opts?.passCsrfToken) {
    params.token = await getCsrfToken();
  }
  const response = await (await post(params))
    .json();
  if (opts?.assertSuccess) {
    assertSuccess(response, action);
  }
  return response;
}

export async function invokeGet(
  action: string,
  params?: GetParams,
  opts?: InvokeOpts,
) {
  const response = await (await get({ action, format: "json", ...params }))
    .json();
  if (opts?.assertSuccess) {
    assertSuccess(response, action);
  }
  return response;
}
