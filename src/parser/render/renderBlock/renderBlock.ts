/**
 * [renderBlock render one block, no matter it is a container block or text block]
 */
export default function renderBlock(
  this: {
    renderBlock: (
      parent: any,
      block: any,
      activeBlocks: any,
      matches: any,
      useCache?: boolean
    ) => any;
    renderLeafBlock: (
      this: any,
      parent: any,
      block: any,
      activeBlocks: any,
      matches: any,
      useCache?: boolean
    ) => import("snabbdom").VNode;
    renderContainerBlock: (
      this: any,
      parent?: any,
      block?: any,
      activeBlocks?: any,
      matches?: any,
      useCache?: boolean
    ) => import("snabbdom").VNode;
    renderIcon: (block: any) => import("snabbdom").VNode;
  },
  parent: any,
  block: any,
  activeBlocks: any,
  matches: any,
  useCache = false
) {
  const method =
    Array.isArray(block.children) && block.children.length > 0
      ? "renderContainerBlock"
      : "renderLeafBlock";

  return this[method](parent, block, activeBlocks, matches, useCache);
}
