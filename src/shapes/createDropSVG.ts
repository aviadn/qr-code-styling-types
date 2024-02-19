export function createDropSVG(size: number, color: string): SVGSVGElement {
  const xmlns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(xmlns, "svg");
  svg.setAttribute("width", size.toString());
  svg.setAttribute("height", size.toString());
  svg.setAttribute("viewBox", "0 0 500 500");
  svg.setAttribute("fill", color);

  const path = document.createElementNS(xmlns, "path");
  path.setAttribute(
    "d",
    "M249.999 499.998C108.3329 499.998 0 391.6651 0 249.999V0h249.999c141.6661 0 249.999 108.3329 249.999 249.999S391.6651 499.998 249.999 499.998z"
  );
  svg.appendChild(path);
  return svg;
}
