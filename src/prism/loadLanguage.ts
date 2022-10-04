import components from "prismjs/components";
// @ts-ignore
import getLoader from "prismjs/dependencies";
import { getDefer } from "../utils";

import Prism from "prismjs";

/**
 * The set of all languages which have been loaded using the below function.
 *
 * @type {Set<string>}
 */
export const loadedLanguages: Set<String> = new Set([
  "markup",
  "css",
  "clike",
  "javascript",
]);

const { languages: allLanguages } = components.languages;

// Look for the origin languge by alias
export const transformAliasToOrigin = (langs: any[]) => {
  const result: any = [];
  for (const lang of langs) {
    if (allLanguages[lang]) {
      result.push(lang);
    } else {
      const language = Object.keys(allLanguages).find((name) => {
        const l = allLanguages[name];
        if (l.alias) {
          return (
            l.alias === lang ||
            (Array.isArray(l.alias) && l.alias.includes(lang))
          );
        }
        return false;
      });

      if (language) {
        result.push(language);
      } else {
        // The lang is not exist, the will handle in `initLoadLanguage`
        result.push(lang);
      }
    }
  }

  return result;
};

function initLoadLanguage(Prism) {
  return async function loadLanguages(langs: string[] | string) {
    // If no argument is passed, load all components
    if (!langs) {
      langs = Object.keys(allLanguages).filter((lang) => lang !== "meta");
    }

    if (langs && !langs.length) {
      return Promise.reject(
        new Error(
          "The first parameter should be a list of load languages or single language."
        )
      );
    }

    if (!Array.isArray(langs)) {
      langs = [langs];
    }

    const promises: any = [];
    // The user might have loaded languages via some other way or used `prism.js` which already includes some
    // We don't need to validate the ids because `getLoader` will ignore invalid ones
    const loaded = [...loadedLanguages, ...Object.keys(Prism.languages)];

    getLoader(components, langs, loaded).load(async (lang: any) => {
      const defer = getDefer();
      promises.push(defer.promise);
      if (!(lang in components.languages)) {
        defer.resolve({
          lang,
          status: "noexist",
        });
      } else if (loadedLanguages.has(lang)) {
        defer.resolve({
          lang,
          status: "cached",
        });
      } else {
        delete Prism.languages[lang];
        await import(/* @vite-ignore */ "prismjs/components/prism-" + lang);
        defer.resolve({
          lang,
          status: "loaded",
        });
        loadedLanguages.add(lang);
      }
    });

    return Promise.all(promises);
  };
}

export default initLoadLanguage;
