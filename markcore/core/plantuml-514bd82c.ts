var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { z as zlib, h, t as toHTML } from "./index-b2a469f3.ts";
const PLANTUML_URL = "https://www.plantuml.com/plantuml";
function replaceChar(tableIn, tableOut, char) {
  const charIndex = tableIn.indexOf(char);
  return tableOut[charIndex];
}
function maketrans(tableIn, tableOut, value) {
  return [...value].map((i) => replaceChar(tableIn, tableOut, i)).join("");
}
class Digram {
  constructor() {
    __publicField(this, "encodedInput", "");
  }
  static parse(input) {
    const digram = new Digram();
    digram.encodedInput = Digram.encode(input);
    return digram;
  }
  static encode(value) {
    const tableIn = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const tableOut = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";
    const utf8Value = decodeURIComponent(encodeURIComponent(value));
    const compressedValue = zlib.deflateSync(utf8Value, { level: 3 });
    const base64Value = compressedValue.toString("base64");
    return maketrans(tableIn, tableOut, base64Value);
  }
  insertImgElement(container) {
    const div = typeof container === "string" ? document.getElementById(container) : container;
    if (div === null || !div.tagName) {
      throw new Error("Invalid container: " + container);
    }
    const src = `${PLANTUML_URL}/svg/~1${this.encodedInput}`;
    const node = h("img", { attrs: { src } });
    div.innerHTML = toHTML(node);
  }
}
export {
  Digram as default
};
