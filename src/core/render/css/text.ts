import { Node } from "figma-api/lib/ast-types";

export const getTextStyle = (textNode: Node<"TEXT">) => {
  const textAlignVertical = textNode.style.textAlignVertical;
  //
  if (textAlignVertical === "CENTER") {
    return {
      fontSize: textNode.style.fontSize,
      fontWeight: textNode.style.fontWeight,
      letterSpacing: textNode.style.letterSpacing,
      textIndent: textNode.style.paragraphIndent,
    };
  }
  return {
    fontSize: textNode.style.fontSize,
    fontWeight: textNode.style.fontWeight,
  };
};

// http://localhost:3000/posts/${slug}
export const renderLink = (link: string, data: any) => {
  const keys = link.match(/(?<=\${).+?(?=})/g);
  if (!keys) {
    return link;
  }
  let result = link;
  keys.forEach((key) => {
    result = result.replace(`\${${key}}`, data[key]);
  });
  return result;
};
