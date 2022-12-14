import loadRenderer from "../../renderers";
import { CLASS_OR_ID, PREVIEW_DOMPURIFY_CONFIG } from "../../config";
import { conflict, mixins, camelToSnake, sanitize } from "../../utils";
import { patch, toVNode, toHTML, h } from "./snabbdom";
import { beginRules } from "../rules";
import renderInlines from "./renderInlines";
import renderBlock from "./renderBlock";

class StateRender {
  muya: any;
  eventCenter: any;
  codeCache: any;
  loadImageMap: any;
  loadMathMap: any;
  mermaidCache: any;
  diagramCache: any;
  tokenCache: any;
  labels: any;
  urlMap: any;
  renderingTable: null;
  renderingRowContainer: null;
  container: null;
  constructor(muya: any) {
    this.muya = muya;
    this.eventCenter = muya.eventCenter;
    this.codeCache = new Map();
    this.loadImageMap = new Map();
    this.loadMathMap = new Map();
    this.mermaidCache = new Map();
    this.diagramCache = new Map();
    this.tokenCache = new Map();
    this.labels = new Map();
    this.urlMap = new Map();
    this.renderingTable = null;
    this.renderingRowContainer = null;
    this.container = null;
  }

  setContainer(container: any) {
    this.container = container;
  }

  // collect link reference definition
  collectLabels(blocks: any) {
    this.labels.clear();

    const travel = (block: any) => {
      const { text, children } = block;
      if (children && children.length) {
        children.forEach((c: any) => travel(c));
      } else if (text) {
        const tokens = beginRules.reference_definition.exec(text);
        if (tokens) {
          const key = (tokens[2] + tokens[3]).toLowerCase();
          if (!this.labels.has(key)) {
            this.labels.set(key, {
              href: tokens[6],
              title: tokens[10] || "",
            });
          }
        }
      }
    };

    blocks.forEach((b: any) => travel(b));
  }

  checkConflicted(block: any, token: any, cursor: any) {
    const { start, end } = cursor;
    const key = block.key;
    const { start: tokenStart, end: tokenEnd } = token.range;

    if (key !== start.key && key !== end.key) {
      return false;
    } else if (key === start.key && key !== end.key) {
      return conflict([tokenStart, tokenEnd], [start.offset, start.offset]);
    } else if (key !== start.key && key === end.key) {
      return conflict([tokenStart, tokenEnd], [end.offset, end.offset]);
    } else {
      return (
        conflict([tokenStart, tokenEnd], [start.offset, start.offset]) ||
        conflict([tokenStart, tokenEnd], [end.offset, end.offset])
      );
    }
  }

  getClassName(outerClass: any, block: any, token: any, cursor: any) {
    return (
      outerClass ||
      (this.checkConflicted(block, token, cursor)
        ? CLASS_OR_ID.AG_GRAY
        : CLASS_OR_ID.AG_HIDE)
    );
  }

  getHighlightClassName(active: any) {
    return active ? CLASS_OR_ID.AG_HIGHLIGHT : CLASS_OR_ID.AG_SELECTION;
  }

  getSelector(block: any, activeBlocks: any) {
    const { cursor, selectedBlock } = this.muya.contentState;
    const type = block.type === "hr" ? "p" : block.type;
    const isActive =
      activeBlocks.some((b: any) => b.key === block.key) ||
      block.key === cursor.start.key;

    let selector = `${type}#${block.key}.${CLASS_OR_ID.AG_PARAGRAPH}`;
    if (isActive) {
      selector += `.${CLASS_OR_ID.AG_ACTIVE}`;
    }
    if (type === "span") {
      selector += `.ag-${camelToSnake(block.functionType)}`;
    }
    if (!block.parent && selectedBlock && block.key === selectedBlock.key) {
      selector += `.${CLASS_OR_ID.AG_SELECTED}`;
    }
    return selector;
  }

  async renderMermaid() {
    if (this.mermaidCache.size) {
      const mermaid: any = await loadRenderer("mermaid");
      mermaid.initialize({
        securityLevel: "strict",
        theme: this.muya.options.mermaidTheme,
      });
      for (const [key, value] of this.mermaidCache.entries()) {
        const { code } = value;
        const target = document.querySelector(key);
        if (!target) {
          continue;
        }
        try {
          mermaid.parse(code);
          target.innerHTML = sanitize(code, PREVIEW_DOMPURIFY_CONFIG, true);
          mermaid.init(undefined, target);
        } catch (err) {
          target.innerHTML = "< Invalid Mermaid Codes >";
          target.classList.add(CLASS_OR_ID.AG_MATH_ERROR);
        }
      }

      this.mermaidCache.clear();
    }
  }

  async renderDiagram() {
    const cache = this.diagramCache;
    if (cache.size) {
      const RENDER_MAP: any = {
        flowchart: await loadRenderer("flowchart"),
        sequence: await loadRenderer("sequence"),
        plantuml: await loadRenderer("plantuml"),
        "vega-lite": await loadRenderer("vega-lite"),
      };

      for (const [key, value] of cache.entries()) {
        const target = document.querySelector(key);
        if (!target) {
          continue;
        }
        const { code, functionType } = value;
        const render = RENDER_MAP[functionType];
        const options = {};
        if (functionType === "sequence") {
          Object.assign(options, { theme: this.muya.options.sequenceTheme });
        } else if (functionType === "vega-lite") {
          Object.assign(options, {
            actions: false,
            tooltip: false,
            renderer: "svg",
            theme: this.muya.options.vegaTheme,
          });
        }
        try {
          if (functionType === "flowchart" || functionType === "sequence") {
            const diagram = render.parse(code);
            target.innerHTML = "";
            diagram.drawSVG(target, options);
          } else if (functionType === "plantuml") {
            const diagram = render.parse(code);
            target.innerHTML = "";
            diagram.insertImgElement(target);
          } else if (functionType === "vega-lite") {
            await render(key, JSON.parse(code), options);
          }
        } catch (err) {
          target.innerHTML = `< Invalid ${
            functionType === "flowchart" ? "Flow Chart" : "Sequence"
          } Codes >`;
          target.classList.add(CLASS_OR_ID.AG_MATH_ERROR);
        }
      }
      this.diagramCache.clear();
    }
  }

  render(blocks: any, activeBlocks: any, matches: any) {
    console.log("render called");
    const selector = `div#${CLASS_OR_ID.AG_EDITOR_ID}`;
    const children = blocks.map((block: any) => {
      return this.renderBlock(null, block, activeBlocks, matches, true);
    });
    const newVdom = h(selector, children);
    const rootDom: any = document.querySelector(selector) || this.container;
    const oldVdom = toVNode(rootDom);

    patch(oldVdom, newVdom);
    this.renderMermaid();
    this.renderDiagram();
    this.codeCache.clear();
  }
  renderBlock(
    arg0?: null,
    block?: any,
    activeBlocks?: any,
    matches?: any,
    arg4?: boolean
  ) {
    throw new Error("Method not implemented.");
  }

  // Only render the blocks which you updated
  partialRender(
    blocks: any,
    activeBlocks: any,
    matches: any,
    startKey: any,
    endKey: any
  ) {
    console.log("partialRender called");
    const cursorOutMostBlock = activeBlocks[activeBlocks.length - 1];
    // If cursor is not in render blocks, need to render cursor block independently
    const needRenderCursorBlock = blocks.indexOf(cursorOutMostBlock) === -1;
    const newVnode = h(
      "section",
      blocks.map((block: any) =>
        this.renderBlock(null, block, activeBlocks, matches)
      )
    );
    const html = toHTML(newVnode).replace(
      /^<section>([\s\S]+?)<\/section>$/,
      "$1"
    );

    const needToRemoved: any = [];
    const firstOldDom = startKey
      ? document.querySelector(`#${startKey}`)
      : //@ts-ignore
        document.querySelector(`div#${CLASS_OR_ID.AG_EDITOR_ID}`)
          .firstElementChild;
    if (!firstOldDom) {
      // TODO@Jocs Just for fix #541, Because I'll rewrite block and render method, it will nolonger have this issue.
      return;
    }
    needToRemoved.push(firstOldDom);
    let nextSibling = firstOldDom.nextElementSibling;
    while (nextSibling && nextSibling.id !== endKey) {
      needToRemoved.push(nextSibling);
      nextSibling = nextSibling.nextElementSibling;
    }
    nextSibling && needToRemoved.push(nextSibling);

    console.log("???????????????html:", html);
    firstOldDom.insertAdjacentHTML("beforebegin", html);

    console.log("????????????oldDom", firstOldDom);
    Array.from(needToRemoved).forEach((dom) => (dom as any).remove());

    // Render cursor block independently
    if (needRenderCursorBlock) {
      const { key } = cursorOutMostBlock;
      const cursorDom = document.querySelector(`#${key}`);
      if (cursorDom) {
        const oldCursorVnode = toVNode(cursorDom);
        const newCursorVnode: any = this.renderBlock(
          null,
          cursorOutMostBlock,
          activeBlocks,
          matches
        );
        patch(oldCursorVnode, newCursorVnode);
      }
    }

    this.renderMermaid();
    this.renderDiagram();
    this.codeCache.clear();
  }

  /**
   * Only render one block.
   *
   * @param {object} block
   * @param {array} activeBlocks
   * @param {array} matches
   */
  singleRender(block: any, activeBlocks: any, matches: any) {
    console.log("singleRender called");
    const selector = `#${block.key}`;
    const newVdom: any = this.renderBlock(
      null,
      block,
      activeBlocks,
      matches,
      true
    );
    const rootDom: any = document.querySelector(selector);
    const oldVdom = toVNode(rootDom);
    patch(oldVdom, newVdom);
    this.renderMermaid();
    this.renderDiagram();
    this.codeCache.clear();
  }

  invalidateImageCache() {
    this.loadImageMap.forEach((imageInfo: any, key: any) => {
      imageInfo.touchMsec = Date.now();
      this.loadImageMap.set(key, imageInfo);
    });
  }
}

mixins(StateRender, renderInlines, renderBlock);

export default StateRender;
