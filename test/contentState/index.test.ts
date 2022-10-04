import escapeCharactersMap, {
  escapeCharacters,
} from "@/parser/escapeCharacter";
import { getUniqueId } from "@/utils";

export {};
function createBlockP(text = "") {
  const pBlock = createBlock("p");
  const contentBlock = createBlock("span", { text });
  appendChild(pBlock, contentBlock);
  return pBlock;
}
function appendChild(parent: any, block: any) {
  const len = parent.children.length;
  const lastChild = parent.children[len - 1];
  parent.children.push(block);
  block.parent = parent.key;
  if (lastChild) {
    lastChild.nextSibling = block.key;
    block.preSibling = lastChild.key;
  } else {
    block.preSibling = null;
  }
  block.nextSibling = null;
}

function createBlock(type = "span", extras: any = {}) {
  const key = getUniqueId();
  const blockData: any = {
    key,
    text: "",
    type,
    editable: true,
    parent: null,
    preSibling: null,
    nextSibling: null,
    children: [],
  };

  // give span block a default functionType `paragraphContent`
  if (type === "span" && !extras.functionType) {
    blockData.functionType = "paragraphContent";
  }

  if (extras.functionType === "codeContent" && extras.text) {
    const CHAR_REG = new RegExp(`(${escapeCharacters.join("|")})`, "gi");
    extras.text = extras.text.replace(CHAR_REG, (_: any, p: any) => {
      return escapeCharactersMap[p];
    });
  }

  Object.assign(blockData, extras);
  return blockData;
}

test("createBlock", () => {
  const result = createBlock("span");
  console.log(result);
  expect(1).toBe(1);
});
