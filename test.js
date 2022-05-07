import test from "node:test";
import assert from "node:assert";

test("Testing a string", () => {
  assert.match("Welcome Node 18", /Node 18/);
});
