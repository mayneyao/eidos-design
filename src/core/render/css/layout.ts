import classnames from "classnames";
import { Node } from "figma-api/lib/ast-types";

export const getLayout = (frame: Node<"FRAME">, isPageFrame = false) => {
  // layout
  const { layoutMode, counterAxisSizingMode, primaryAxisSizingMode } = frame;
  let layout = "flex-wrap";
  const flexDirection = layoutMode === "HORIZONTAL" ? "flex-row" : "flex-col";
  layout = classnames(layout, flexDirection);
  const { primaryAxisAlignItems, counterAxisAlignItems } = frame;
  switch (primaryAxisAlignItems) {
    case "MIN":
      layout = classnames(layout, "justify-start");
      break;
    case "CENTER":
      layout = classnames(layout, "justify-center");
      break;
    case "MAX":
      layout = classnames(layout, "justify-end");
      break;
    case "SPACE_BETWEEN":
      layout = classnames(layout, "justify-between");
      break;
  }
  switch (counterAxisAlignItems) {
    case "MIN":
      layout = classnames(layout, "items-start");
      break;
    case "CENTER":
      layout = classnames(layout, "items-center");
      break;
    case "MAX":
      layout = classnames(layout, "items-end");
      break;
    case "BASELINE":
      layout = classnames(layout, "items-baseline");
      break;
  }
  const gap = frame.itemSpacing;

  return {
    className: classnames("flex", layout, gap && `gap-[${gap}px]`),
    style: {
      gap: gap ? `${gap}px` : undefined,
    },
  };
};
