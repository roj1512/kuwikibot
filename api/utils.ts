import { assertEquals } from "https://deno.land/std@0.140.0/testing/asserts.ts";

// deno-lint-ignore no-explicit-any
export function assertSuccess(response: any, action: string) {
  assertEquals(response[action].result, "Success");
}

