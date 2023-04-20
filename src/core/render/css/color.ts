/* eslint-disable @next/next/no-img-element */
import { Color, Paint, Node } from "figma-api/lib/ast-types";

/**
 * turn rgb to hex
 */
export const figmaColor2hex = (color: Color) => {
  const { r, g, b } = color;
  const red = r * 255;
  const green = g * 255;
  const blue = b * 255;
  const hex = (blue | (green << 8) | (red << 16) | (1 << 24))
    .toString(16)
    .slice(1);
  return `#${hex}`;
};

export const figmaFill2Style = (fills: Paint[], isText: boolean = false) => {
  const colorStyle: any = {};
  const key = isText ? "color" : "backgroundColor";
  fills.forEach((fill) => {
    if (fill.type === "SOLID" && fill.color) {
      const { r, g, b } = fill.color;
      colorStyle[key] = `rgba(${Math.round(r * 255)}, ${Math.round(
        g * 255
      )}, ${Math.round(b * 255)},${fill.opacity ?? 1})`;
    }
  });
  return colorStyle;
};

export const getNodeColor = (node: any, isPageFrame: boolean) => {
  // color and background
  const colorStyle: any = figmaFill2Style(node.fills, node.type === "TEXT");

  const bg = (node as any).fills.map((fill: any) => {
    if (fill.type === "SOLID") {
      return `bg-[${figmaColor2hex(fill.color!)}]`;
    }
  });

  return {
    className: bg.join(" "),
    style: colorStyle,
  };
};
