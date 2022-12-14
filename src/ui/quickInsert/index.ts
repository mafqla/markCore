import { filter } from "fuzzaldrin";
import { patch, h } from "../../parser/render/snabbdom";
import { deepCopy } from "../../utils";
import BaseScrollFloat from "../baseScrollFloat";
import { quickInsertObj } from "./config";
import "./index.css";

class QuickInsert extends BaseScrollFloat {
  static pluginName = "quickInsert";
  oldVnode: any;
  _renderObj: any;
  block: any;

  constructor(muya: any) {
    const name = "ag-quick-insert";
    super(muya, name);
    this.reference = null;
    this.oldVnode = null;
    this._renderObj = null;
    this.renderArray = null;
    this.activeItem = null;
    this.block = null;
    this.renderObj = quickInsertObj;
    this.render();
    this.listen();
  }

  get renderObj() {
    return this._renderObj;
  }

  set renderObj(obj) {
    this._renderObj = obj;
    const renderArray: any = [];
    Object.keys(obj).forEach((key) => {
      renderArray.push(...obj[key]);
    });
    this.renderArray = renderArray;
    if (this.renderArray.length > 0) {
      this.activeItem = this.renderArray[0];
      const activeEle = this.getItemElement(this.activeItem);
      this.activeEleScrollIntoView(activeEle);
    }
  }

  render() {
    const { scrollElement, activeItem, _renderObj } = this;
    let children: any = Object.keys(_renderObj)
      .filter((key) => {
        return _renderObj[key].length !== 0;
      })
      .map((key) => {
        const titleVnode = h("div.title", key.toUpperCase());
        const items: any = [];
        for (const item of _renderObj[key]) {
          const { title, subTitle, label, icon, shortCut } = item;
          const iconVnode = h(
            "div.icon-container",
            h(
              "i.icon",
              h(
                `i.icon-${label.replace(/\s/g, "-")}`,
                {
                  style: {
                    background: `url(${icon}) no-repeat`,
                    "background-size": "100%",
                  },
                },
                ""
              )
            )
          );

          const description = h("div.description", [
            h("div.big-title", title),
            h("div.sub-title", subTitle),
          ]);
          const shortCutVnode = h("div.short-cut", [h("span", shortCut)]);
          const selector =
            activeItem.label === label ? "div.item.active" : "div.item";
          items.push(
            h(
              selector,
              {
                dataset: { label },
                on: {
                  click: () => {
                    this.selectItem(item);
                  },
                },
              },
              [iconVnode, description, shortCutVnode]
            )
          );
        }

        return h("section", [titleVnode, ...items]);
      });

    if (children.length === 0) {
      children = h("div.no-result", "No result");
    }
    const vnode = h("div", children);

    if (this.oldVnode) {
      patch(this.oldVnode, vnode);
    } else {
      patch(scrollElement, vnode);
    }
    this.oldVnode = vnode;
  }

  listen() {
    super.listen();
    const { eventCenter } = this.muya;
    eventCenter.subscribe(
      "muya-quick-insert",
      (reference: any, block: any, status: any) => {
        if (status) {
          console.log(status);
          this.block = block;
          this.show(reference);
          this.search(block.text.substring(1)); // remove `@` char
        } else {
          this.hide();
        }
      }
    );
  }

  search(text: any) {
    const { contentState } = this.muya;
    const canInserFrontMatter = contentState.canInserFrontMatter(this.block);
    const obj = deepCopy(quickInsertObj);
    if (!canInserFrontMatter) {
      obj["basic block"].splice(2, 1);
    }
    let result = obj;
    if (text !== "") {
      result = {};
      Object.keys(obj).forEach((key) => {
        // @ts-ignore
        result[key] = filter(obj[key], text, { key: "title" });
      });
    }
    this.renderObj = result;
    this.render();
  }

  selectItem(item: any) {
    const { contentState } = this.muya;
    this.block.text = "";
    const { key } = this.block;
    const offset = 0;
    contentState.cursor = {
      start: { key, offset },
      end: { key, offset },
    };
    switch (item.label) {
      case "paragraph":
        contentState.partialRender();
        break;
      default:
        contentState.updateParagraph(item.label, true);
        break;
    }
    // delay hide to avoid dispatch enter hander
    setTimeout(this.hide.bind(this));
  }

  // @ts-ignore
  getItemElement(item: any) {
    const { label } = item;
    return this.scrollElement.querySelector(`[data-label="${label}"]`);
  }
}

export default QuickInsert;
