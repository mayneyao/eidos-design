import {
  createComponentTypeMap,
  generateReactElement,
} from "@/core/render/element";

export default function Components({
  dataMap,
  page,
  file,
}: {
  file: any;
  page: any;
  dataMap: any;
}) {
  const componentMap = createComponentTypeMap(file);
  const components = generateReactElement(page!, true, dataMap, componentMap);
  return <>{components}</>;
}
