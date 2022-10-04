import { describe, it, expect } from "vitest";

import {
  loadedLanguages,
  loadLanguage,
  search,
  transformAliasToOrigin,
} from "@/prism";

describe("prism", () => {
  it("search(): 模糊搜索编程语言", () => {
    const result = search("typescript");
    expect(result).toEqual([
      {
        name: "typescript",
        title: "TypeScript",
        require: "javascript",
        optional: "js-templates",
        alias: "ts",
        owner: "vkbansal",
      },
    ]);
  });
  it.todo("loadLanguage", () => {
    loadLanguage("javascript").then((res) => {
      console.log(res);
    });
  });
  it.todo("loadedLanguages", () => {
    loadedLanguages;
  });
  it.todo("transformAliasToOrigin", () => {
    transformAliasToOrigin;
  });
});
