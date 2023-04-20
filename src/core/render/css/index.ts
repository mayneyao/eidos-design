import classnames from "classnames";
import { getBox } from "./box";
import { getNodeColor } from "./color";
import { getLayout } from "./layout";

export const figmaNode2css = (node: any, isPageFrame = false) => {
  const isTextNode = node.type === "TEXT";
  let fns = [getLayout, getBox, getNodeColor];
  if (isTextNode) {
    fns = [getBox, getNodeColor];
  }
  const { style, className } = fns.reduce(
    (acc: any, fn) => {
      const { style, className } = fn(node, isPageFrame) as any;
      return {
        style: {
          ...acc.style,
          ...style,
        },
        className: classnames(acc.className, className),
      };
    },
    {
      style: {},
      className: "",
    }
  );
  return { style, className };
};
