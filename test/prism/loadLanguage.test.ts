import { test, expect } from "vitest";

import initLoadLanguage, { transformAliasToOrigin } from "@/prism/loadLanguage";

/**
 * @jest-environment jsdom
 */
test.todo("transformAliasToOrigin()", () => {
  expect(1).toBe(1);
});

test.todo("initLoadLanguage", () => {
  const result = initLoadLanguage(["javascript", "c"]);
  console.log(result("java"));
  expect(2).toBe(2);
});

describe("prism", () => {
  it.todo("transformAliasToOrigin()");
});
