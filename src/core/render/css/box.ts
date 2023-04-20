/* eslint-disable @next/next/no-img-element */
import { Node } from "figma-api/lib/ast-types";
import { px2rem } from "./utils";
import classnames from "classnames";

export const getFrameWidthAndHeight = (
  frame: Node<"FRAME">,
  isPage = false
) => {
  let width, height;
  width = frame.absoluteBoundingBox?.width;
  height = frame.absoluteBoundingBox?.height;
  const { layoutMode, counterAxisSizingMode, primaryAxisSizingMode } = frame;
  const primaryAxisSize = layoutMode === "HORIZONTAL" ? width : height;
  const counterAxisSize = layoutMode === "HORIZONTAL" ? height : width;

  if (layoutMode === 'NONE') { 

    // TODO
  }
  const getAxisSize = (axisSizingMode: string, size: number) => {
    switch (axisSizingMode) {
      case "FIXED":
        return isPage ? "100%" : size;
      case "AUTO":
        return "auto";
      case "STRETCH":
        return "100%";
    }
  };

  width = layoutMode === "HORIZONTAL" ? getAxisSize(primaryAxisSizingMode, primaryAxisSize) : getAxisSize(counterAxisSizingMode, counterAxisSize);
  height = layoutMode === "HORIZONTAL" ? getAxisSize(counterAxisSizingMode, counterAxisSize) : getAxisSize(primaryAxisSizingMode, primaryAxisSize);

  return {
    width,
    minWidth: width,
    height,
  };
};

export const getPadding = (node: Node<"FRAME">) => {
  const { paddingLeft, paddingRight, paddingTop, paddingBottom } = node;
  const paddingStyle = {
    paddingLeft: paddingLeft && `${px2rem(paddingLeft)}`,
    paddingRight: paddingRight && `${px2rem(paddingRight)}`,
    paddingTop: paddingTop && `${px2rem(paddingTop)}`,
    paddingBottom: paddingBottom && `${px2rem(paddingBottom)}`,
  };
  const padding = classnames(
    paddingLeft && `pl-[${paddingLeft}px]`,
    paddingRight && `pr-[${paddingRight}px]`,
    paddingTop && `pt-[${paddingTop}px]`,
    paddingBottom && `pb-[${paddingBottom}px]`
  );
  return {
    className: padding,
    style: paddingStyle,
  };
};

export const getBox = (node: Node<"FRAME">, isPage: boolean) => {
  const { width, height } = getFrameWidthAndHeight(node, isPage);
  const padding = getPadding(node);

  return {
    className: classnames(padding.className),
    style: {
      width,
      height,
      borderRadius: node.cornerRadius,
      ...padding.style,
    },
  };
};
